"""Packing list endpoints — sources orders from confirmed pos_itempick rows and
writes pos_itempack.

Rules:
- Only orders with a *confirmed* pos_itempick row (itempick_confirm=1) show up here.
- Pack # stays empty until "Mark as Packed & Ready" inserts the pos_itempack row.
- itempack_confirm=1 is set when the order is marked Delivered from the UI
  (the same action that prints the packing list, per product decision).
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models.it_user_master import ITUserMaster
from app.models.pos_itemlots import PosItemLots
from app.models.pos_itempack import PosItemPack
from app.models.pos_itempick import PosItemPick
from app.models.pos_orddtl import PosOrdDtl
from app.models.pos_ordhed import PosOrdHed
from app.models.pos_package_type import PosPackageType
from app.models.pos_staff import PosStaff
from app.routes.auth import get_current_user
from app.seller_utils import get_customer_name, get_store_id, short_user_code, staff_code, staff_display_name

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
    status: str  # "Pending" | "Packed & Ready" | "Delivered"
    packNo: str
    packageType: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    packedBy: Optional[str] = None
    remarks: str


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


def _to_order_out(session: Session, order: PosOrdHed, pick: PosItemPick) -> PackingOrderOut:
    lines = session.exec(
        select(PosOrdDtl).where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel != True)  # noqa: E712
    ).all()
    pack = _latest_pack(session, order.OrdNo)

    if pack:
        pack_status = "Delivered" if pack.itempack_confirm else "Packed & Ready"
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
    current_user: ITUserMaster = Depends(get_current_user),
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
    current_user: ITUserMaster = Depends(get_current_user),
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
    current_user: ITUserMaster = Depends(get_current_user),
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
    current_user: ITUserMaster = Depends(get_current_user),
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
        itempack_mdby=short_user_code(current_user),
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
    current_user: ITUserMaster = Depends(get_current_user),
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
    pack.itempack_mdby = short_user_code(current_user)
    session.add(pack)
    session.commit()

    return _to_order_out(session, order, pick)


@router.post("/{ord_no}/deliver", response_model=PackingDetailOut)
def mark_delivered(
    ord_no: str,
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    """Print Packing List / Mark as Delivered — sets itempack_confirm=1."""
    order = _get_order_or_404(session, ord_no)
    pick = _confirmed_pick(session, ord_no)
    pack = _latest_pack(session, ord_no)
    if not pack:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mark this order as packed & ready before it can be delivered",
        )
    if pack.itempack_confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This order is already marked as delivered")

    pack.itempack_confirm = True
    pack.itempack_mddate = datetime.utcnow()
    pack.itempack_mdby = short_user_code(current_user)
    session.add(pack)
    session.commit()

    return PackingDetailOut(order=_to_order_out(session, order, pick), items=_to_items_out(session, order))
