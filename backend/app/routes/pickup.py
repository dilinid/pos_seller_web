"""Pickup list endpoints — backed by pos_ordhed/pos_orddtl and pos_itempick.

Pick # rule: a pos_itempick row (and therefore a "PK-####" pick number) only
exists once an order's pick sheet has been printed. Orders with no pick record
yet show an empty pick number. Confirming a pick sets itempick_confirm=1.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models.it_user_master import ITUserMaster
from app.models.pos_itemlots import PosItemLots
from app.models.pos_itempick import PosItemPick
from app.models.pos_orddtl import PosOrdDtl
from app.models.pos_ordhed import OrderStatus, PosOrdHed
from app.models.pos_staff import PosStaff
from app.routes.auth import get_current_user
from app.seller_utils import get_customer_name, get_store_id, short_user_code, staff_code, staff_display_name

router = APIRouter(prefix="/api/seller/pickup-list", tags=["pickup"])

# Order statuses that still belong on the picker's worklist. Orders confirmed
# for picking move to "packing" and remain visible (badge flips to Confirmed)
# until a future packing step advances them further.
ACTIVE_STATUSES = (OrderStatus.PENDING, OrderStatus.PICKING, OrderStatus.PACKING)


# ── request/response schemas ─────────────────────────────────────────────────


class PickupItemOut(BaseModel):
    lineno: int
    itemCode: str
    itemName: str
    location: str
    qtyOrdered: float
    qtyPicked: Optional[float] = None


class PickupOrderOut(BaseModel):
    orderNo: str
    orderDate: Optional[str] = None
    customer: str
    totalItems: int
    status: str  # "Pending" | "Confirmed"
    pickNo: str
    remarks: str
    picker: Optional[str] = None


class PickupDetailOut(BaseModel):
    order: PickupOrderOut
    items: list[PickupItemOut]


class RemarksUpdateRequest(BaseModel):
    remarks: str


class PrintPickRequest(BaseModel):
    pickerId: int


class ConfirmPickItem(BaseModel):
    lineno: int
    qtyPicked: float


class ConfirmPickRequest(BaseModel):
    items: list[ConfirmPickItem]
    remarks: Optional[str] = None


# ── helpers ──────────────────────────────────────────────────────────────────


def _get_order_or_404(session: Session, ord_no: str) -> PosOrdHed:
    order = session.get(PosOrdHed, ord_no)
    if not order or order.cancel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


def _latest_pick(session: Session, ord_no: str) -> Optional[PosItemPick]:
    stmt = (
        select(PosItemPick)
        .where(PosItemPick.itempick_ordno == ord_no)
        .order_by(PosItemPick.itempick_id.desc())
    )
    return session.exec(stmt).first()


def _to_order_out(session: Session, order: PosOrdHed) -> PickupOrderOut:
    lines = session.exec(
        select(PosOrdDtl).where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel != True)  # noqa: E712
    ).all()
    pick = _latest_pick(session, order.OrdNo)

    return PickupOrderOut(
        orderNo=order.OrdNo,
        orderDate=order.created_at.isoformat() if order.created_at else None,
        customer=get_customer_name(session, order.member),
        totalItems=len(lines),
        status="Confirmed" if (pick and pick.itempick_confirm) else "Pending",
        pickNo=f"PK-{pick.itempick_id:04d}" if pick else "",
        remarks=(pick.itempick_Remark or "") if pick else "",
        picker=staff_display_name(session, pick.itempick_user) if pick else None,
    )


def _to_items_out(session: Session, order: PosOrdHed) -> list[PickupItemOut]:
    lines = session.exec(
        select(PosOrdDtl)
        .where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel != True)  # noqa: E712
        .order_by(PosOrdDtl.lineno)
    ).all()

    items: list[PickupItemOut] = []
    for line in lines:
        lot = None
        if line.itemcode:
            lot_stmt = select(PosItemLots).where(PosItemLots.itemlots_code == line.itemcode)
            if line.storeId:
                lot_stmt = lot_stmt.where(PosItemLots.itemlots_loc == line.storeId)
            lot = session.exec(lot_stmt).first()

        items.append(
            PickupItemOut(
                lineno=line.lineno,
                itemCode=line.itemcode or "",
                itemName=(lot.itemlots_desc if lot and lot.itemlots_desc else (line.itemcode or "")),
                location=(lot.itemlots_loc if lot and lot.itemlots_loc else (line.storeId or "")),
                qtyOrdered=float(line.qty) if line.qty is not None else 0.0,
                qtyPicked=float(line.pickqty) if line.pickqty is not None else None,
            )
        )
    return items


# ── endpoints ────────────────────────────────────────────────────────────────


@router.get("", response_model=list[PickupOrderOut])
def list_pickup_orders(
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    store_id = get_store_id(session)
    stmt = select(PosOrdHed).where(PosOrdHed.status.in_(ACTIVE_STATUSES)).where(
        PosOrdHed.cancel != True  # noqa: E712
    )
    if store_id:
        stmt = stmt.where(PosOrdHed.storeId == store_id)
    stmt = stmt.order_by(PosOrdHed.created_at.desc())

    orders = session.exec(stmt).all()
    return [_to_order_out(session, order) for order in orders]


@router.get("/{ord_no}", response_model=PickupDetailOut)
def get_pickup_order(
    ord_no: str,
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    return PickupDetailOut(order=_to_order_out(session, order), items=_to_items_out(session, order))


@router.post("/{ord_no}/print", response_model=PickupDetailOut)
def print_pickup_order(
    ord_no: str,
    body: PrintPickRequest,
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    """Print the pick sheet. First print inserts the pos_itempick row (assigning
    the Pick # and the selected picker); reprinting an already-printed, unconfirmed
    order is idempotent but may reassign the picker. Confirmed picks are locked."""
    order = _get_order_or_404(session, ord_no)
    picker = session.get(PosStaff, body.pickerId)
    if not picker or not picker.status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid picker")

    now = datetime.utcnow()

    pick = _latest_pick(session, ord_no)
    if not pick:
        pick = PosItemPick(
            itempick_ordno=ord_no,
            itempick_loc=order.storeId,
            itempick_mddate=now,
            itempick_user=staff_code(picker),
            itempick_mdby=short_user_code(current_user),
            itempick_confirm=False,
        )
        session.add(pick)

        if order.status == OrderStatus.PENDING:
            order.status = OrderStatus.PICKING
            order.md_at = now
            session.add(order)

        session.commit()
        session.refresh(order)
    elif not pick.itempick_confirm:
        pick.itempick_user = staff_code(picker)
        pick.itempick_mddate = now
        pick.itempick_mdby = short_user_code(current_user)
        session.add(pick)
        session.commit()

    return PickupDetailOut(order=_to_order_out(session, order), items=_to_items_out(session, order))


@router.patch("/{ord_no}/remarks", response_model=PickupOrderOut)
def update_pickup_remarks(
    ord_no: str,
    body: RemarksUpdateRequest,
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    pick = _latest_pick(session, ord_no)
    if not pick:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Print the pick list before adding remarks",
        )

    pick.itempick_Remark = body.remarks
    pick.itempick_mddate = datetime.utcnow()
    pick.itempick_mdby = short_user_code(current_user)
    session.add(pick)
    session.commit()

    return _to_order_out(session, order)


@router.post("/{ord_no}/confirm", response_model=PickupDetailOut)
def confirm_pickup_order(
    ord_no: str,
    body: ConfirmPickRequest,
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    pick = _latest_pick(session, ord_no)
    if not pick:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Print the pick list before confirming",
        )
    if pick.itempick_confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This pick has already been confirmed")

    now = datetime.utcnow()
    user_code = short_user_code(current_user)

    lines_by_no = {
        line.lineno: line
        for line in session.exec(select(PosOrdDtl).where(PosOrdDtl.OrdNo == ord_no)).all()
    }
    for item in body.items:
        line = lines_by_no.get(item.lineno)
        if line is None:
            continue
        line.pickqty = item.qtyPicked
        line.md_at = now
        session.add(line)

    pick.itempick_confirm = True
    pick.itempick_mddate = now
    pick.itempick_mdby = user_code
    if body.remarks is not None:
        pick.itempick_Remark = body.remarks
    session.add(pick)

    order.status = OrderStatus.PACKING
    order.md_at = now
    session.add(order)

    session.commit()
    session.refresh(order)

    return PickupDetailOut(order=_to_order_out(session, order), items=_to_items_out(session, order))
