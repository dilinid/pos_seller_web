"""Packing list endpoints — sources orders from confirmed pos_itempick rows and
writes pos_itempack.

Rules:
- Only orders with a *confirmed* pos_itempick row (itempick_confirm=1) show up here.
- Pack # stays empty until "Mark as Packed & Ready" inserts the pos_itempack row.
- itempack_confirm=1 is set when the order is marked Shipped from the UI
  (the same action that prints the packing list, per product decision). This
  also advances pos_ordhed.status from "packing" to "shipped" via Ordering's
  /internal/orders/* API (see _call_ordering_status below) — Packing itself
  never writes pos_ordhed directly.

Owned by: Packing service (pos_itempack). Reads pos_ordhed/pos_orddtl (owned by
Ordering) and pos_itempick (owned by Picking) directly against the shared DB.
The one write Packing makes outside its own tables — advancing order status on
ship — goes through Ordering's /internal/* API rather than writing pos_ordhed
directly, same convention Picking->Ordering uses. See libs/pos_common/README.md
for the ownership convention.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.config import settings
from pos_common.auth import TokenClaims, get_current_user
from pos_common.database import get_session
from pos_common.http_client import InternalCallError, internal_patch
from pos_common.models.pos_itemdeliver import PosItemDeliver
from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_itempack import PosItemPack
from pos_common.models.pos_itempick import PosItemPick
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed
from pos_common.models.pos_package_type import PosPackageType
from pos_common.models.pos_staff import PosStaff
from pos_common.seller_utils import get_customer_name, get_store_id, short_user_code, staff_code, staff_display_name

router = APIRouter(prefix="/api/seller/packing-list", tags=["packing"])
meta_router = APIRouter(prefix="/api/seller", tags=["packing"])


# ── request/response schemas ─────────────────────────────────────────────────


class PackageTypeOut(BaseModel):
    id: int
    type: str
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None


class PackingItemOut(BaseModel):
    lineno: int
    itemCode: str
    itemName: str
    qtyOrdered: float
    qtyPicked: Optional[float] = None
    packed: bool


class PackingOrderOut(BaseModel):
    orderNo: str
    date: Optional[str] = None
    customer: str
    shippingAddress: str
    totalItems: int
    status: str  # "Pending" | "Packed & Ready" | "Shipped"
    packNo: str
    packageType: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    packedBy: Optional[str] = None
    remarks: str
    deliveryAgent: Optional[str] = None
    deliveryAgentContact: Optional[str] = None
    deliveryVehicle: Optional[str] = None
    deliveryRefNo: Optional[str] = None
    deliveryCusPhone: Optional[str] = None
    deliveryEstimateDays: Optional[int] = None
    deliveryRemark: Optional[str] = None


class PackingDetailOut(BaseModel):
    order: PackingOrderOut
    items: list[PackingItemOut]


class RemarksUpdateRequest(BaseModel):
    remarks: str


class MarkPackedRequest(BaseModel):
    packageTypeId: int
    packerId: int
    weight: float
    remarks: Optional[str] = None


class DeliveryDetailsRequest(BaseModel):
    agent: Optional[str] = None
    agentContact: Optional[str] = None
    vehicleNo: Optional[str] = None
    refNo: Optional[str] = None
    cusPhone: Optional[str] = None
    estimateDays: Optional[int] = None
    remark: Optional[str] = None


# ── helpers ──────────────────────────────────────────────────────────────────


def _get_order_or_404(session: Session, ord_no: str) -> PosOrdHed:
    order = session.get(PosOrdHed, ord_no)
    if not order or order.cancel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def _confirmed_pick(session: Session, ord_no: str) -> Optional[PosItemPick]:
    stmt = (
        select(PosItemPick)
        .where(PosItemPick.itempick_ordno == ord_no, PosItemPick.itempick_confirm == True)  # noqa: E712
        .order_by(PosItemPick.itempick_id.desc())
    )
    return session.exec(stmt).first()


def _latest_pack(session: Session, ord_no: str) -> Optional[PosItemPack]:
    stmt = (
        select(PosItemPack)
        .where(PosItemPack.itempack_ordno == ord_no)
        .order_by(PosItemPack.itempack_id.desc())
    )
    return session.exec(stmt).first()


def _latest_delivery(session: Session, ord_no: str) -> Optional[PosItemDeliver]:
    stmt = (
        select(PosItemDeliver)
        .where(PosItemDeliver.itemdeliver_ordno == ord_no)
        .order_by(PosItemDeliver.itemdeliver_id.desc())
    )
    return session.exec(stmt).first()


def _call_ordering_status(ord_no: str, new_status: OrderStatus, expected_current: OrderStatus) -> None:
    try:
        internal_patch(
            f"{settings.ORDERING_SERVICE_URL}/internal/orders/{ord_no}/status",
            json={"status": new_status.value, "expectedCurrentStatus": expected_current.value},
            token=settings.INTERNAL_SERVICE_TOKEN,
        )
    except InternalCallError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not update the order — try again",
        )


def _to_order_out(session: Session, order: PosOrdHed, pick: PosItemPick) -> PackingOrderOut:
    lines = session.exec(
        select(PosOrdDtl).where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel != True)  # noqa: E712
    ).all()
    pack = _latest_pack(session, order.OrdNo)
    delivery = _latest_delivery(session, order.OrdNo)

    if pack:
        pack_status = "Shipped" if pack.itempack_confirm else "Packed & Ready"
        record_date = pack.itempack_mddate
    else:
        pack_status = "Pending"
        record_date = pick.itempick_mddate

    return PackingOrderOut(
        orderNo=order.OrdNo,
        date=record_date.isoformat() if record_date else None,
        customer=get_customer_name(session, order.member),
        shippingAddress=order.ordaddress or "",
        totalItems=len(lines),
        status=pack_status,
        packNo=f"PL-{pack.itempack_id:04d}" if pack else "",
        packageType=pack.itempack_pakagetype if pack else None,
        weight=float(pack.itempack_weight) if pack and pack.itempack_weight is not None else None,
        dimensions=pack.itempack_dimenstion if pack else None,
        packedBy=staff_display_name(session, pack.itempack_user) if pack else None,
        remarks=(pack.itempack_Remark or "") if pack else "",
        deliveryAgent=delivery.itemdeliver_agent if delivery else None,
        deliveryAgentContact=delivery.itemdeliver_agentcontact if delivery else None,
        deliveryVehicle=delivery.itemdeliver_vehicle if delivery else None,
        deliveryRefNo=delivery.itemdeliver_refno if delivery else None,
        deliveryCusPhone=delivery.itemdeliver_cusphone if delivery else None,
        deliveryEstimateDays=delivery.itemdeliver_estimatedays if delivery else None,
        deliveryRemark=delivery.itemdeliver_remark if delivery else None,
    )


def _to_items_out(session: Session, order: PosOrdHed) -> list[PackingItemOut]:
    lines = session.exec(
        select(PosOrdDtl)
        .where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel != True)  # noqa: E712
        .order_by(PosOrdDtl.lineno)
    ).all()

    items: list[PackingItemOut] = []
    for line in lines:
        lot = None
        if line.itemcode:
            lot_stmt = select(PosItemLots).where(PosItemLots.itemlots_code == line.itemcode)
            if line.storeId:
                lot_stmt = lot_stmt.where(PosItemLots.itemlots_loc == line.storeId)
            lot = session.exec(lot_stmt).first()

        picked = float(line.pickqty) if line.pickqty is not None else None
        items.append(
            PackingItemOut(
                lineno=line.lineno,
                itemCode=line.itemcode or "",
                itemName=(lot.itemlots_desc if lot and lot.itemlots_desc else (line.itemcode or "")),
                qtyOrdered=float(line.qty) if line.qty is not None else 0.0,
                qtyPicked=picked,
                packed=bool(picked and picked > 0),
            )
        )
    return items


# ── endpoints ────────────────────────────────────────────────────────────────


@meta_router.get("/package-types", response_model=list[PackageTypeOut])
def list_package_types(
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    stmt = select(PosPackageType).where(PosPackageType.status == True).order_by(PosPackageType.type)  # noqa: E712
    types = session.exec(stmt).all()
    return [
        PackageTypeOut(
            id=t.id,
            type=t.type,
            length=float(t.length) if t.length is not None else None,
            width=float(t.width) if t.width is not None else None,
            height=float(t.height) if t.height is not None else None,
        )
        for t in types
    ]


@router.get("", response_model=list[PackingOrderOut])
def list_packing_orders(
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    store_id = get_store_id(session)

    stmt = select(PosItemPick).where(PosItemPick.itempick_confirm == True)  # noqa: E712
    if store_id:
        stmt = stmt.where(PosItemPick.itempick_loc == store_id)
    picks = session.exec(stmt.order_by(PosItemPick.itempick_id.desc())).all()

    # One packing-list row per order — keep the most recently confirmed pick per OrdNo.
    latest_pick_by_order: dict[str, PosItemPick] = {}
    for pick in picks:
        if pick.itempick_ordno not in latest_pick_by_order:
            latest_pick_by_order[pick.itempick_ordno] = pick

    results: list[PackingOrderOut] = []
    for ord_no, pick in latest_pick_by_order.items():
        order = session.get(PosOrdHed, ord_no)
        if not order or order.cancel:
            continue
        results.append(_to_order_out(session, order, pick))

    results.sort(key=lambda o: o.date or "", reverse=True)
    return results


@router.get("/{ord_no}", response_model=PackingDetailOut)
def get_packing_order(
    ord_no: str,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    pick = _confirmed_pick(session, ord_no)
    if not pick:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This order has no confirmed pick up record",
        )
    return PackingDetailOut(order=_to_order_out(session, order, pick), items=_to_items_out(session, order))


@router.post("/{ord_no}/pack", response_model=PackingDetailOut)
def mark_packed(
    ord_no: str,
    body: MarkPackedRequest,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """Mark as Packed & Ready — inserts the pos_itempack row (assigning Pack #)."""
    order = _get_order_or_404(session, ord_no)
    pick = _confirmed_pick(session, ord_no)
    if not pick:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This order must be picked and confirmed before it can be packed",
        )
    if _latest_pack(session, ord_no):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This order has already been packed")

    package_type = session.get(PosPackageType, body.packageTypeId)
    if not package_type or not package_type.status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid package type")

    packer = session.get(PosStaff, body.packerId)
    if not packer or not packer.status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid packer")

    dims = [package_type.length, package_type.width, package_type.height]
    dimensions = " x ".join(f"{float(d):g}" for d in dims) + " cm" if all(d is not None for d in dims) else None

    now = datetime.utcnow()

    pack = PosItemPack(
        itempack_ordno=ord_no,
        itempack_loc=order.storeId,
        itempack_mddate=now,
        itempack_user=staff_code(packer),
        itempack_mdby=short_user_code(current_user.id),
        itempack_pakagetype=package_type.type,
        itempack_weight=body.weight,
        itempack_dimenstion=dimensions,
        itempack_Remark=body.remarks,
        itempack_confirm=False,
    )
    session.add(pack)
    session.commit()

    return PackingDetailOut(order=_to_order_out(session, order, pick), items=_to_items_out(session, order))


@router.patch("/{ord_no}/remarks", response_model=PackingOrderOut)
def update_packing_remarks(
    ord_no: str,
    body: RemarksUpdateRequest,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    pick = _confirmed_pick(session, ord_no)
    pack = _latest_pack(session, ord_no)
    if not pack:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mark this order as packed before adding remarks",
        )

    pack.itempack_Remark = body.remarks
    pack.itempack_mddate = datetime.utcnow()
    pack.itempack_mdby = short_user_code(current_user.id)
    session.add(pack)
    session.commit()

    return _to_order_out(session, order, pick)


@router.post("/{ord_no}/ship", response_model=PackingDetailOut)
def mark_shipped(
    ord_no: str,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """Print Packing List / Mark as Shipped — sets itempack_confirm=1 and advances
    pos_ordhed.status from "packing" to "shipped" via Ordering's /internal/* API."""
    order = _get_order_or_404(session, ord_no)
    pick = _confirmed_pick(session, ord_no)
    pack = _latest_pack(session, ord_no)
    if not pack:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mark this order as packed & ready before it can be shipped",
        )
    if pack.itempack_confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This order is already marked as shipped")

    # Call Ordering BEFORE committing our own local change — see module docstring's
    # write-ownership note and Picking's pickup.py for the same commit-order convention.
    _call_ordering_status(ord_no, OrderStatus.SHIPPED, OrderStatus.PACKING)

    pack.itempack_confirm = True
    pack.itempack_mddate = datetime.utcnow()
    pack.itempack_mdby = short_user_code(current_user.id)
    session.add(pack)
    session.commit()
    session.refresh(order)

    return PackingDetailOut(order=_to_order_out(session, order, pick), items=_to_items_out(session, order))


@router.patch("/{ord_no}/delivery-details", response_model=PackingOrderOut)
def update_delivery_details(
    ord_no: str,
    body: DeliveryDetailsRequest,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """Save/update the Delivery Details panel — upserts the pos_itemdeliver row."""
    order = _get_order_or_404(session, ord_no)
    pick = _confirmed_pick(session, ord_no)
    if not pick:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This order has no confirmed pick up record",
        )

    now = datetime.utcnow()
    mdby = short_user_code(current_user.id)
    delivery = _latest_delivery(session, ord_no)
    if not delivery:
        delivery = PosItemDeliver(itemdeliver_ordno=ord_no, itemdeliver_loc=order.storeId, itemdeliver_user=mdby)

    delivery.itemdeliver_agent = body.agent
    delivery.itemdeliver_agentcontact = body.agentContact
    delivery.itemdeliver_vehicle = body.vehicleNo
    delivery.itemdeliver_refno = body.refNo
    delivery.itemdeliver_cusphone = body.cusPhone
    delivery.itemdeliver_estimatedays = body.estimateDays
    delivery.itemdeliver_remark = body.remark
    delivery.itemdeliver_mddate = now
    delivery.itemdeliver_mdby = mdby
    session.add(delivery)
    session.commit()

    return _to_order_out(session, order, pick)
