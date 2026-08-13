"""Pickup ("picking") list endpoints — backed by pos_itempick (owned here) plus
read-only access to pos_ordhed/pos_orddtl (owned by Ordering).

Pick # rule: a pos_itempick row (and therefore a "PK-####" pick number) only
exists once an order's pick sheet has been printed. Orders with no pick record
yet show an empty pick number. Confirming a pick sets itempick_confirm=1.

Owned by: Picking service (pos_itempick). Order status transitions and
pos_orddtl.pickqty writes are owned by Ordering — this service calls
Ordering's /internal/orders/* API for those instead of writing those tables
directly (see pos_common.http_client + libs/pos_common/README.md for the
ownership convention, and the plan's "resolving the transactional coupling"
section for why a synchronous call was chosen over an event/outbox here).

Confirming a pick also moves the picked lines' reservation into
itemlots_pick (see pos_common.inventory.adjust_itemlots_stock) — the one
sanctioned direct write this service makes outside pos_itempick, since
pos_itemlots has no in-repo owner to route it through instead.

Failure handling: both print (first print) and confirm call Ordering BEFORE
committing this service's own local pos_itempick change. If the Ordering call
fails, nothing is committed locally and the client gets a 502 — so Picking's
local state is always a strict subset of what Ordering has confirmed. See the
plan's risk notes for the one residual failure window this doesn't cover
(Ordering commits, the response is lost before Picking sees it).
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.config import settings
from pos_common.auth import TokenClaims, get_current_user
from pos_common.database import get_session
from pos_common.http_client import InternalCallError, internal_patch
from pos_common.inventory import adjust_itemlots_stock
from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_itempick import PosItemPick
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed
from pos_common.models.pos_staff import PosStaff
from pos_common.seller_utils import get_customer_name, short_user_code, staff_code, staff_display_name

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


def _latest_pick(session: Session, order: PosOrdHed) -> Optional[PosItemPick]:
    """The order's own pick row, if any.

    A pick row is only ever inserted in the same call that moves an order out
    of "pending" (see print_pickup_order below), so while the order is still
    pending it cannot have a real pick of its own yet. Returning early here
    guards against OrdNo reuse: if pos_ordhed ever gets reset/pruned while
    pos_itempick isn't cleared alongside it, a new order can be assigned an
    OrdNo a previous (possibly confirmed) order already used, and a naive
    match-by-OrdNo query would wrongly attach that old pick — and its
    Confirmed status — to the new, still-pending order.
    """
    if order.status == OrderStatus.PENDING:
        return None
    stmt = (
        select(PosItemPick)
        .where(PosItemPick.itempick_ordno == order.OrdNo)
        .order_by(PosItemPick.itempick_id.desc())
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


def _call_ordering_pick_quantities(ord_no: str, items: list[dict]) -> None:
    if not items:
        return
    try:
        internal_patch(
            f"{settings.ORDERING_SERVICE_URL}/internal/orders/{ord_no}/pick-quantities",
            json={"items": items},
            token=settings.INTERNAL_SERVICE_TOKEN,
        )
    except InternalCallError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not update the order — try again",
        )


def _to_order_out(session: Session, order: PosOrdHed) -> PickupOrderOut:
    lines = session.exec(
        select(PosOrdDtl).where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel != True)  # noqa: E712
    ).all()
    pick = _latest_pick(session, order)

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
    current_user: TokenClaims = Depends(get_current_user),
):
    stmt = (
        select(PosOrdHed)
        .where(PosOrdHed.status.in_(ACTIVE_STATUSES))
        .where(PosOrdHed.cancel != True)  # noqa: E712
        .order_by(PosOrdHed.created_at.desc())
    )

    orders = session.exec(stmt).all()
    return [_to_order_out(session, order) for order in orders]


@router.get("/{ord_no}", response_model=PickupDetailOut)
def get_pickup_order(
    ord_no: str,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    return PickupDetailOut(order=_to_order_out(session, order), items=_to_items_out(session, order))


@router.post("/{ord_no}/print", response_model=PickupDetailOut)
def print_pickup_order(
    ord_no: str,
    body: PrintPickRequest,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """Print the pick sheet. First print inserts the pos_itempick row (assigning
    the Pick # and the selected picker); reprinting an already-printed, unconfirmed
    order is idempotent but may reassign the picker. Confirmed picks are locked."""
    order = _get_order_or_404(session, ord_no)
    picker = session.get(PosStaff, body.pickerId)
    if not picker or not picker.status:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid picker")

    now = datetime.utcnow()

    pick = _latest_pick(session, order)
    if not pick:
        if order.status == OrderStatus.PENDING:
            # Call Ordering BEFORE committing our own local row — see module docstring.
            _call_ordering_status(ord_no, OrderStatus.PICKING, OrderStatus.PENDING)
            # Ordering owns this write, but reflect it locally right away rather than
            # relying on session.refresh() to observe it — the response built below
            # needs order.status to already read "picking" so _latest_pick treats the
            # row we're about to insert as this order's own pick.
            order.status = OrderStatus.PICKING

        pick = PosItemPick(
            itempick_ordno=ord_no,
            itempick_loc=order.storeId,
            itempick_mddate=now,
            itempick_user=staff_code(picker),
            itempick_mdby=short_user_code(current_user.id),
            itempick_confirm=False,
        )
        session.add(pick)
        session.commit()
        session.refresh(order)
    elif not pick.itempick_confirm:
        pick.itempick_user = staff_code(picker)
        pick.itempick_mddate = now
        pick.itempick_mdby = short_user_code(current_user.id)
        session.add(pick)
        session.commit()

    return PickupDetailOut(order=_to_order_out(session, order), items=_to_items_out(session, order))


@router.patch("/{ord_no}/remarks", response_model=PickupOrderOut)
def update_pickup_remarks(
    ord_no: str,
    body: RemarksUpdateRequest,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    pick = _latest_pick(session, order)
    if not pick:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Print the pick list before adding remarks",
        )

    pick.itempick_Remark = body.remarks
    pick.itempick_mddate = datetime.utcnow()
    pick.itempick_mdby = short_user_code(current_user.id)
    session.add(pick)
    session.commit()

    return _to_order_out(session, order)


@router.post("/{ord_no}/confirm", response_model=PickupDetailOut)
def confirm_pickup_order(
    ord_no: str,
    body: ConfirmPickRequest,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    order = _get_order_or_404(session, ord_no)
    pick = _latest_pick(session, order)
    if not pick:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Print the pick list before confirming",
        )
    if pick.itempick_confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This pick has already been confirmed")

    lines_by_no = {
        line.lineno: line
        for line in session.exec(select(PosOrdDtl).where(PosOrdDtl.OrdNo == ord_no)).all()
    }
    pick_items = [
        {"lineno": item.lineno, "qtyPicked": item.qtyPicked}
        for item in body.items
        if item.lineno in lines_by_no
    ]

    now = datetime.utcnow()
    user_code = short_user_code(current_user.id)

    # Both calls must succeed before we commit anything locally — see module docstring.
    _call_ordering_pick_quantities(ord_no, pick_items)
    _call_ordering_status(ord_no, OrderStatus.PACKING, OrderStatus.PICKING)

    pick.itempick_confirm = True
    pick.itempick_mddate = now
    pick.itempick_mdby = user_code
    if body.remarks is not None:
        pick.itempick_Remark = body.remarks
    session.add(pick)

    # Move each picked line's reservation into itemlots_pick — released here,
    # not at order time, so itemlots_reserve always means "ordered, not yet
    # picked." Lines the picker reported as 0/unpicked don't move any stock.
    for item in body.items:
        line = lines_by_no.get(item.lineno)
        if not line or not line.itemcode or not item.qtyPicked:
            continue
        qty = Decimal(str(item.qtyPicked))
        adjust_itemlots_stock(session, line.itemcode, line.storeId, pick_delta=qty, reserve_delta=-qty)

    session.commit()
    # Refresh after commit (fresh snapshot) so this reflects Ordering's already-
    # committed pickqty/status writes, not this transaction's pre-call snapshot.
    session.refresh(order)

    return PickupDetailOut(order=_to_order_out(session, order), items=_to_items_out(session, order))
