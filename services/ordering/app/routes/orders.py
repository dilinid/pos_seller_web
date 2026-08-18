"""Marketplace order endpoints — place orders and let a buyer read back their
own order history, backed by the real pos_ordhed/pos_orddtl rows. Order type
'ONL' distinguishes these from in-store POS orders ('POS'); return requests
are 'RTN' rows linked back to their source order via `refno` (see
request_return/refund_return below) — no approval step, so filing a return
immediately saves it as RETURNED and the store dashboard processes it from
there to REFUNDED.

Owned by: Ordering service (pos_ordhed, pos_orddtl, pos_invhed, pos_invdtl,
pos_invpay). Picking and Packing read these tables directly (shared physical
DB) but must never write them — order-status/pick-quantity writes triggered by
Picking's workflow go through this service's /internal/orders/* API (see
app/routes/internal.py) instead.
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from pos_common.auth import TokenClaims, get_current_user
from pos_common.database import get_session
from pos_common.inventory import adjust_itemlots_stock
from pos_common.models.pos_customer import PosCustomer
from pos_common.models.pos_invdtl import PosInvDtl
from pos_common.models.pos_invhed import PosInvHed
from pos_common.models.pos_invpay import PosInvPay
from pos_common.models.pos_item_resource import PosItemResource
from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_loc import PosLoc
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed
from pos_common.models.pos_paymode import PosPayMode
from pos_common.models.pos_setup import PosSetup

router = APIRouter(prefix="/api/marketplace", tags=["orders"])

ORDER_TYPE_ONLINE = "ONL"
ORD_NO_PREFIX = "O"
ORD_NO_DIGITS = 6  # prefix + digits fills the 7-char OrdNo column
MAX_ORD_NO_ATTEMPTS = 5

# Return requests are their own pos_ordhed row (type 'RTN'), linked back to the
# original order via `refno` — the same generic-column-reuse trick 'ONL' uses
# (pricemode for payment method, refno for the online invoice's source order).
# No pos_return_type/new columns: pricemode holds a short reason code below,
# ordaddress (meaningless for a return, which never ships anywhere) holds the
# buyer's free-text note, and storeId holds the buyer's chosen return/drop-off
# location instead of the original order's location (see request_return).
RETURN_ORDER_TYPE = "RTN"
RETURN_ORD_NO_PREFIX = "R"

RETURN_REASON_TO_PRICEMODE = {
    "defective": "DEF",
    "wrong_item": "WIT",
    "no_longer_needed": "NLN",
    "wrong_size": "WSZ",
    "other": "OTH",
}
PRICEMODE_TO_RETURN_REASON = {v: k for k, v in RETURN_REASON_TO_PRICEMODE.items()}
ReturnReasonLiteral = Literal["defective", "wrong_item", "no_longer_needed", "wrong_size", "other"]

# pos_ordhed.InvNo caps invoice numbers at 7 chars, so online invoice numbers get
# their own short prefix — mirrors ORD_NO_PREFIX's scheme, kept out of the external
# POS application's own (longer) invoice numbering.
INV_NO_PREFIX = "N"
INV_NO_DIGITS = 6

# Card payments are captured immediately at checkout (no real gateway — see
# CardDetailsForm), so they're recorded in pos_invpay under this pos_paymode.pay_code.
# The paytype description stored on each payment row is looked up from pos_paymode
# itself (not hardcoded) so it always matches that reference table.
CARD_PAY_CODE = "CRD"

# pos_ordhed has no dedicated payment-method column. `pricemode` is unused by
# the external POS application for online ('ONL') orders, so it doubles as
# storage for how the buyer paid.
PAYMENT_METHOD_TO_PRICEMODE = {"card": "CARD", "cod": "COD"}
PRICEMODE_TO_PAYMENT_METHOD = {v: k for k, v in PAYMENT_METHOD_TO_PRICEMODE.items()}

# Refund payment methods offered on the store dashboard's refund action —
# 'card' is the default. Distinct from PAYMENT_METHOD_TO_PRICEMODE above
# (that's what the buyer originally paid with; this is how the store pays a
# refund back out, which doesn't have to match).
CASH_PAY_CODE = "CSH"
RefundMethodLiteral = Literal["card", "cash"]
REFUND_METHOD_TO_PAY_CODE = {"card": CARD_PAY_CODE, "cash": CASH_PAY_CODE}
REFUND_METHOD_TO_PRICEMODE = {"card": "CARD", "cash": "CASH"}

ESTIMATED_DELIVERY = "3-5 business days"


# ── request/response schemas ─────────────────────────────────────────────────


class PlaceOrderItem(BaseModel):
    itemCode: str
    quantity: float = Field(gt=0)
    price: float = Field(ge=0)


class PlaceOrderRequest(BaseModel):
    items: list[PlaceOrderItem]
    deliveryMethod: Literal["delivery", "pickup"]
    deliveryAddress: Optional[str] = None
    deliveryFee: float = 0
    paymentMethod: Literal["card", "cod"]
    # The pos_loc.loc_code the buyer picked from the store-location dropdown —
    # which pos_itemlots row this order's stock is reserved/stamped against.
    locationCode: str = Field(min_length=1, max_length=10)


class PlaceOrderResponse(BaseModel):
    ordNo: str
    status: str
    createdAt: str


class ReturnRequestItem(BaseModel):
    itemCode: str
    quantity: float = Field(gt=0)


class ReturnRequestBody(BaseModel):
    items: list[ReturnRequestItem]
    reason: ReturnReasonLiteral
    note: Optional[str] = None
    # The pos_loc.loc_code the buyer picked as where they intend to drop off /
    # ship back the item — purely informational (see request_return below):
    # refund-time restocking still targets the original order line's own
    # storeId, not this. Stored as the RTN row's own storeId.
    returnLocationCode: str = Field(min_length=1, max_length=10)


class RefundRequestBody(BaseModel):
    method: RefundMethodLiteral = "card"
    # Card-reference details entered by the cashier when refunding to a card —
    # there's no real payment gateway here (see CARD_PAY_CODE above), so these
    # are just kept as a paper trail on the refund's pos_invpay row. Required
    # only when method == "card"; ignored for cash refunds.
    cardType: Optional[str] = Field(default=None, max_length=20)
    cardLastFour: Optional[str] = Field(default=None, min_length=4, max_length=4)


class OrderItemOut(BaseModel):
    productId: str
    productName: str
    productImage: Optional[str] = None
    price: float
    mrp: Optional[float] = None
    quantity: float
    unit: str
    deliveryMethod: Literal["delivery", "pickup"]
    deliveryFee: float
    status: str
    # Whether this line's item is eligible to be returned at all
    # (pos_itemlots.is_returnable) — independent of whether this particular
    # order has any return window/quantity left.
    isReturnable: bool = False
    returnReason: Optional[str] = None
    returnReasonNote: Optional[str] = None


class OrderOut(BaseModel):
    id: str
    createdAt: str
    updatedAt: str
    items: list[OrderItemOut]
    buyerName: str
    buyerPhone: Optional[str] = None
    buyerEmail: Optional[str] = None
    deliveryAddress: str
    deliveryDistrict: str
    orderNotes: str
    paymentMethod: Literal["card", "cod"]
    paymentStatus: Literal["pending", "paid"]
    grandTotal: float
    estimatedDelivery: str
    # True for RTN pseudo-orders (a return request against `originalOrderId`).
    isReturn: bool = False
    originalOrderId: Optional[str] = None
    # Only meaningful (and only ever True) on a non-return ONL order: whether
    # the buyer can still file a return request against it right now.
    returnEligible: bool = False
    # This order's own pos_loc — the location it was placed at (ONL) or the
    # buyer's chosen drop-off location (RTN, see ReturnRequestBody.returnLocationCode).
    locationCode: Optional[str] = None
    locationName: Optional[str] = None
    locationAddress: Optional[str] = None
    # RTN rows only: the *original* order's location, resolved via `refno`.
    originalLocationName: Optional[str] = None
    originalLocationAddress: Optional[str] = None


# ── helpers ──────────────────────────────────────────────────────────────────


def _require_customer(session: Session, current_user: TokenClaims) -> PosCustomer:
    customer = session.get(PosCustomer, current_user.customer_id) if current_user.customer_id else None
    if not customer or not customer.cus_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No customer profile is linked to this account",
        )
    return customer


def _item_thumbnail(session: Session, item_code: Optional[str]) -> Optional[str]:
    if not item_code:
        return None
    stmt = (
        select(PosItemResource)
        .where(PosItemResource.resource_itemlots_code == item_code)
        .where(PosItemResource.resource_type == "image")
        .where(PosItemResource.is_approved == 1)
        .order_by(PosItemResource.is_primary.desc(), PosItemResource.resource_sort_order)
    )
    resource = session.exec(stmt).first()
    if not resource:
        return None
    path = resource.resource_path
    if path.startswith(("http://", "https://", "/")):
        return path
    return f"/{path}"


def _location_label(session: Session, loc_code: Optional[str]) -> tuple[Optional[str], Optional[str]]:
    """Resolves a pos_loc.loc_code to its (name, address) for display — used for
    both an order's own location and, for RTN rows, the original order's."""
    if not loc_code:
        return None, None
    loc = session.get(PosLoc, loc_code)
    if not loc:
        return None, None
    return loc.loc_desc, loc.loc_address


def _returned_quantities_for_order(session: Session, ord_no: str) -> dict[str, Decimal]:
    """Sums quantities already returned (non-cancelled RTN lines) against a
    given original order, keyed by itemcode — used both to cap how much of a
    line the buyer can still return and to decide per-item return eligibility."""
    stmt = (
        select(PosOrdDtl.itemcode, PosOrdDtl.qty)
        .join(PosOrdHed, PosOrdHed.OrdNo == PosOrdDtl.OrdNo)
        .where(PosOrdHed.type == RETURN_ORDER_TYPE)
        .where(PosOrdHed.refno == ord_no)
        .where(PosOrdHed.cancel.isnot(True))
        .where(PosOrdDtl.cancel.isnot(True))
    )
    totals: dict[str, Decimal] = {}
    for itemcode, qty in session.exec(stmt):
        if not itemcode:
            continue
        totals[itemcode] = totals.get(itemcode, Decimal("0")) + (qty or Decimal("0"))
    return totals


def _within_return_window(order: PosOrdHed, setup: Optional[PosSetup]) -> bool:
    if setup is None or setup.setup_rtndays is None or order.created_at is None:
        return True
    deadline = order.created_at + timedelta(days=setup.setup_rtndays)
    return datetime.utcnow() <= deadline


def _to_order_out(session: Session, order: PosOrdHed, customer: PosCustomer) -> OrderOut:
    is_return = order.type == RETURN_ORDER_TYPE

    lines = session.exec(
        select(PosOrdDtl)
        # `cancel != True` excludes NULL rows under SQL's three-valued logic (NULL != True
        # is NULL, not true) — isnot(True) correctly keeps both NULL and False as "active".
        .where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel.isnot(True))
        .order_by(PosOrdDtl.lineno)
    ).all()

    original_order: Optional[PosOrdHed] = None
    return_reason: Optional[str] = None
    return_note: Optional[str] = None

    if is_return:
        original_order = session.get(PosOrdHed, order.refno) if order.refno else None
        delivery_method: Literal["delivery", "pickup"] = "delivery" if (original_order and original_order.ordaddress) else "pickup"
        total_fee = 0.0
        return_reason = PRICEMODE_TO_RETURN_REASON.get(order.pricemode or "")
        return_note = order.ordaddress
    else:
        delivery_method = "delivery" if order.ordaddress else "pickup"
        total_fee = float(order.addamount) if order.addamount is not None else 0.0

    already_returned = {} if is_return else _returned_quantities_for_order(session, order.OrdNo)

    # Only needed to decide returnEligible below — skip the extra query when it
    # can't possibly matter (return rows and non-delivered orders are never
    # return-eligible regardless of the window).
    setup = session.exec(select(PosSetup)).first() if (not is_return and order.status == OrderStatus.DELIVERED) else None

    has_returnable_remaining = False
    items: list[OrderItemOut] = []
    for idx, line in enumerate(lines):
        lot = None
        if line.itemcode:
            lot_stmt = select(PosItemLots).where(PosItemLots.itemlots_code == line.itemcode)
            if line.storeId:
                lot_stmt = lot_stmt.where(PosItemLots.itemlots_loc == line.storeId)
            lot = session.exec(lot_stmt).first()

        is_returnable = bool(lot and lot.is_returnable)
        if is_returnable and not is_return and line.itemcode:
            remaining = (line.qty or Decimal("0")) - already_returned.get(line.itemcode, Decimal("0"))
            if remaining > 0:
                has_returnable_remaining = True

        items.append(
            OrderItemOut(
                productId=line.itemcode or "",
                productName=(lot.itemlots_desc if lot and lot.itemlots_desc else (line.itemcode or "")),
                productImage=_item_thumbnail(session, line.itemcode),
                price=float(line.sprice) if line.sprice is not None else 0.0,
                quantity=float(line.qty) if line.qty is not None else 0.0,
                unit=(lot.itemlots_uom if lot and lot.itemlots_uom else ""),
                deliveryMethod=delivery_method,
                # Delivery fee is order-level, not per line — attribute it to the
                # first item only so summing item fees doesn't overcount.
                deliveryFee=total_fee if idx == 0 else 0.0,
                status=order.status.value if hasattr(order.status, "value") else str(order.status),
                isReturnable=is_returnable,
                returnReason=return_reason,
                returnReasonNote=return_note,
            )
        )

    net_amount = order.netamount if order.netamount is not None else Decimal("0")
    pay_amount = order.payamount if order.payamount is not None else Decimal("0")
    payment_status: Literal["pending", "paid"] = "paid" if pay_amount >= net_amount and net_amount > 0 else "pending"

    if is_return:
        source_pricemode = original_order.pricemode if original_order else None
        payment_method = PRICEMODE_TO_PAYMENT_METHOD.get(source_pricemode or "", "card")
        delivery_address = (original_order.ordaddress or "") if original_order else ""
    else:
        payment_method = PRICEMODE_TO_PAYMENT_METHOD.get(order.pricemode or "", "card")
        delivery_address = order.ordaddress or ""

    return_eligible = bool(
        not is_return
        and order.status == OrderStatus.DELIVERED
        and has_returnable_remaining
        and _within_return_window(order, setup)
    )

    location_name, location_address = _location_label(session, order.storeId)
    original_location_name: Optional[str] = None
    original_location_address: Optional[str] = None
    if is_return and original_order:
        original_location_name, original_location_address = _location_label(session, original_order.storeId)

    return OrderOut(
        id=order.OrdNo,
        createdAt=order.created_at.isoformat() if order.created_at else "",
        updatedAt=(order.md_at or order.created_at).isoformat() if (order.md_at or order.created_at) else "",
        items=items,
        buyerName=customer.cus_name or "Unknown",
        buyerPhone=customer.cus_tep1,
        buyerEmail=customer.cus_email,
        deliveryAddress=delivery_address,
        deliveryDistrict="",
        orderNotes="",
        paymentMethod=payment_method,
        paymentStatus=payment_status,
        grandTotal=float(net_amount),
        estimatedDelivery=ESTIMATED_DELIVERY if not is_return else "",
        isReturn=is_return,
        originalOrderId=order.refno if is_return else None,
        returnEligible=return_eligible,
        locationCode=order.storeId,
        locationName=location_name,
        locationAddress=location_address,
        originalLocationName=original_location_name,
        originalLocationAddress=original_location_address,
    )


def _generate_ord_no(session: Session) -> str:
    """Sequential OrdNo under a dedicated prefix so it never collides with the
    external POS application's own numbering of the shared pos_ordhed table."""
    stmt = (
        select(PosOrdHed.OrdNo)
        .where(PosOrdHed.OrdNo.like(f"{ORD_NO_PREFIX}%"))
        .order_by(PosOrdHed.OrdNo.desc())
    )
    next_num = 1
    for ord_no in session.exec(stmt):
        suffix = ord_no[len(ORD_NO_PREFIX):]
        if suffix.isdigit():
            next_num = int(suffix) + 1
            break
    return f"{ORD_NO_PREFIX}{next_num:0{ORD_NO_DIGITS}d}"


def _generate_inv_no(session: Session) -> str:
    """Sequential InvNo under a dedicated prefix, independent of the external POS
    application's own invoice numbering of the shared pos_invhed table."""
    stmt = (
        select(PosInvHed.InvNo)
        .where(PosInvHed.InvNo.like(f"{INV_NO_PREFIX}%"))
        .order_by(PosInvHed.InvNo.desc())
    )
    next_num = 1
    for inv_no in session.exec(stmt):
        suffix = inv_no[len(INV_NO_PREFIX):]
        if suffix.isdigit():
            next_num = int(suffix) + 1
            break
    return f"{INV_NO_PREFIX}{next_num:0{INV_NO_DIGITS}d}"


def _generate_return_ord_no(session: Session) -> str:
    """Sequential OrdNo for return orders under their own prefix — same scheme
    as _generate_ord_no, kept as a separate counter so 'RTN' order numbers
    never collide with 'ONL' ones."""
    stmt = (
        select(PosOrdHed.OrdNo)
        .where(PosOrdHed.OrdNo.like(f"{RETURN_ORD_NO_PREFIX}%"))
        .order_by(PosOrdHed.OrdNo.desc())
    )
    next_num = 1
    for ord_no in session.exec(stmt):
        suffix = ord_no[len(RETURN_ORD_NO_PREFIX):]
        if suffix.isdigit():
            next_num = int(suffix) + 1
            break
    return f"{RETURN_ORD_NO_PREFIX}{next_num:0{ORD_NO_DIGITS}d}"


# ── endpoints ────────────────────────────────────────────────────────────────


@router.post("/orders", response_model=PlaceOrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    body: PlaceOrderRequest,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    if not body.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order must contain at least one item")

    customer = _require_customer(session, current_user)

    for item in body.items:
        exists = session.exec(
            select(PosItemLots.itemlots_id)
            .where(PosItemLots.itemlots_code == item.itemCode)
            .where(PosItemLots.itemlots_active == True)  # noqa: E712
        ).first()
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item '{item.itemCode}' is not available",
            )

    if body.deliveryMethod == "delivery" and not (body.deliveryAddress and body.deliveryAddress.strip()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Delivery address is required")

    store_id = body.locationCode
    now = datetime.utcnow()
    created_by_id = str(current_user.id) if current_user.id is not None else None

    delivery_fee = Decimal(str(body.deliveryFee))
    gross_amount = sum((Decimal(str(item.price)) * Decimal(str(item.quantity)) for item in body.items), Decimal("0"))
    net_amount = gross_amount + delivery_fee
    pay_amount = net_amount if body.paymentMethod == "card" else Decimal("0")
    due_amount = net_amount - pay_amount

    address = (body.deliveryAddress or "").strip()[:200] if body.deliveryMethod == "delivery" else None

    card_paymode: Optional[PosPayMode] = None
    if body.paymentMethod == "card":
        card_paymode = session.get(PosPayMode, CARD_PAY_CODE)
        if not card_paymode:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Card payment mode is not configured",
            )

    last_error: Optional[Exception] = None
    for _ in range(MAX_ORD_NO_ATTEMPTS):
        # Everything below — header, lines, the itemlots reserve adjustment, and
        # (for card payments) the invoice rows — lives in ONE try/except. A
        # colliding ord_no (two near-simultaneous checkouts racing _generate_ord_no)
        # can surface as an IntegrityError at any of several points, not just the
        # final commit: adjust_itemlots_stock's SELECT ... FOR UPDATE and
        # _generate_inv_no's SELECT both trigger SQLAlchemy's autoflush, which can
        # flush the pending header/line INSERTs — and therefore hit the collision —
        # well before session.commit() is ever called. A single try/except around
        # the whole attempt ensures a collision caught at any of those points rolls
        # back this attempt and retries with a fresh ord_no, instead of propagating
        # as an unhandled 500.
        try:
            ord_no = _generate_ord_no(session)
            order = PosOrdHed(
                OrdNo=ord_no,
                type=ORDER_TYPE_ONLINE,
                status=OrderStatus.PENDING,
                # Card payments are captured immediately at checkout, so the order is
                # invoiced on creation; COD orders stay uninvoiced until paid on delivery.
                is_invoiced=body.paymentMethod == "card",
                created_at=now,
                created_by_id=created_by_id,
                storeId=store_id,
                member=customer.cus_code,
                ordaddress=address,
                pricemode=PAYMENT_METHOD_TO_PRICEMODE[body.paymentMethod],
                grossamount=gross_amount,
                addamount=delivery_fee,
                netamount=net_amount,
                payamount=pay_amount,
                dueamount=due_amount,
                cancel=False,
            )
            session.add(order)

            line_items = [
                (lineno, item, Decimal(str(item.quantity)), Decimal(str(item.price)))
                for lineno, item in enumerate(body.items, start=1)
            ]

            for lineno, item, qty, price in line_items:
                session.add(
                    PosOrdDtl(
                        OrdNo=ord_no,
                        lineno=lineno,
                        created_at=now,
                        created_by_id=created_by_id,
                        storeId=store_id,
                        itemcode=item.itemCode,
                        qty=qty,
                        sprice=price,
                        amount=qty * price,
                        cancel=False,
                    )
                )
                # Reserve the ordered quantity against inventory — released back by
                # Picking (see pos_common.inventory) once this line is picked.
                adjust_itemlots_stock(session, item.itemCode, store_id, reserve_delta=qty)

            if body.paymentMethod == "card":
                inv_no = _generate_inv_no(session)
                order.InvNo = inv_no
                session.add(
                    PosInvHed(
                        InvNo=inv_no,
                        created_at=now,
                        created_by_id=created_by_id,
                        storeId=store_id,
                        member=customer.cus_code,
                        pricemode=PAYMENT_METHOD_TO_PRICEMODE[body.paymentMethod],
                        refno=ord_no,
                        grossamount=gross_amount,
                        addamount=delivery_fee,
                        netamount=net_amount,
                        dueamount=Decimal("0"),
                        payamount=net_amount,
                        cancel=False,
                    )
                )
                for lineno, item, qty, price in line_items:
                    session.add(
                        PosInvDtl(
                            InvNo=inv_no,
                            lineno=lineno,
                            created_at=now,
                            created_by_id=created_by_id,
                            storeId=store_id,
                            itemcode=item.itemCode,
                            qty=qty,
                            sprice=price,
                            amount=qty * price,
                            cancel=False,
                        )
                    )
                session.add(
                    PosInvPay(
                        Invno=inv_no,
                        paytype=card_paymode.pay_code,
                        created_at=now,
                        created_by_id=created_by_id,
                        storeId=store_id,
                        paytypedesc=card_paymode.pay_typedesc,
                        payamt=net_amount,
                        amount=net_amount,
                        cancel=False,
                    )
                )

            session.commit()
        except IntegrityError as exc:
            session.rollback()
            last_error = exc
            continue

        session.refresh(order)
        return PlaceOrderResponse(
            ordNo=order.OrdNo,
            status=order.status.value if hasattr(order.status, "value") else str(order.status),
            createdAt=order.created_at.isoformat() if order.created_at else now.isoformat(),
        )

    session.rollback()
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to allocate an order number. Please try again.",
    ) from last_error


@router.post("/orders/{ord_no}/return", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def request_return(
    ord_no: str,
    body: ReturnRequestBody,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """Files a return request against one of the buyer's own delivered orders.
    No approval step: this immediately creates a 'RTN' pos_ordhed row with
    status RETURNED, which the store dashboard then processes for refund (see
    refund_return below). Inventory is NOT restocked here — only once the
    store actually refunds it."""
    if not body.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Return must include at least one item")

    customer = _require_customer(session, current_user)

    order = session.get(PosOrdHed, ord_no)
    if not order or order.type != ORDER_TYPE_ONLINE or order.member != customer.cus_code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if order.status != OrderStatus.DELIVERED:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only delivered orders can be returned")

    setup = session.exec(select(PosSetup)).first()
    if not _within_return_window(order, setup):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The return window for this order has expired")

    order_lines = {
        line.itemcode: line
        for line in session.exec(
            select(PosOrdDtl).where(PosOrdDtl.OrdNo == ord_no, PosOrdDtl.cancel.isnot(True))
        ).all()
        if line.itemcode
    }
    already_returned = _returned_quantities_for_order(session, ord_no)

    validated: list[tuple[PosOrdDtl, Decimal]] = []
    for item in body.items:
        line = order_lines.get(item.itemCode)
        if line is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item '{item.itemCode}' is not part of this order",
            )

        lot_stmt = select(PosItemLots).where(PosItemLots.itemlots_code == item.itemCode)
        if line.storeId:
            lot_stmt = lot_stmt.where(PosItemLots.itemlots_loc == line.storeId)
        lot = session.exec(lot_stmt).first()
        if not lot or not lot.is_returnable:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Item '{item.itemCode}' is not eligible for return",
            )

        qty = Decimal(str(item.quantity))
        ordered_qty = line.qty or Decimal("0")
        remaining = ordered_qty - already_returned.get(item.itemCode, Decimal("0"))
        if qty > remaining:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {remaining} unit(s) of '{item.itemCode}' are eligible to be returned",
            )

        validated.append((line, qty))

    reason_code = RETURN_REASON_TO_PRICEMODE[body.reason]
    now = datetime.utcnow()
    created_by_id = str(current_user.id) if current_user.id is not None else None
    note = (body.note or "").strip()[:200] or None

    last_error: Optional[Exception] = None
    for _ in range(MAX_ORD_NO_ATTEMPTS):
        try:
            rtn_ord_no = _generate_return_ord_no(session)
            gross_amount = sum(((line.sprice or Decimal("0")) * qty for line, qty in validated), Decimal("0"))

            rtn_order = PosOrdHed(
                OrdNo=rtn_ord_no,
                type=RETURN_ORDER_TYPE,
                status=OrderStatus.RETURNED,
                is_invoiced=False,
                created_at=now,
                created_by_id=created_by_id,
                # The buyer's chosen return/drop-off location — informational
                # only (see ReturnRequestBody.returnLocationCode); restocking
                # below still targets each line's own (original) storeId.
                storeId=body.returnLocationCode,
                member=customer.cus_code,
                refno=ord_no,
                pricemode=reason_code,
                ordaddress=note,
                grossamount=gross_amount,
                netamount=gross_amount,
                payamount=Decimal("0"),
                dueamount=gross_amount,
                cancel=False,
            )
            session.add(rtn_order)

            for lineno, (line, qty) in enumerate(validated, start=1):
                sprice = line.sprice or Decimal("0")
                session.add(
                    PosOrdDtl(
                        OrdNo=rtn_ord_no,
                        lineno=lineno,
                        created_at=now,
                        created_by_id=created_by_id,
                        storeId=line.storeId,
                        itemcode=line.itemcode,
                        qty=qty,
                        sprice=sprice,
                        amount=sprice * qty,
                        cancel=False,
                    )
                )

            session.commit()
        except IntegrityError as exc:
            session.rollback()
            last_error = exc
            continue

        session.refresh(rtn_order)
        return _to_order_out(session, rtn_order, customer)

    session.rollback()
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to allocate a return order number. Please try again.",
    ) from last_error


@router.get("/orders", response_model=list[OrderOut])
def list_my_orders(
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """The current buyer's own order history — online orders only, newest first."""
    customer = _require_customer(session, current_user)

    stmt = (
        select(PosOrdHed)
        .where(PosOrdHed.type == ORDER_TYPE_ONLINE)
        .where(PosOrdHed.member == customer.cus_code)
        .order_by(PosOrdHed.created_at.desc())
    )
    orders = session.exec(stmt).all()
    return [_to_order_out(session, order, customer) for order in orders]


@router.get("/orders/returns", response_model=list[OrderOut])
def list_my_returns(
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """The current buyer's own return requests, newest first. Registered ahead
    of GET /orders/{ord_no} below so 'returns' isn't swallowed as an ord_no."""
    customer = _require_customer(session, current_user)

    stmt = (
        select(PosOrdHed)
        .where(PosOrdHed.type == RETURN_ORDER_TYPE)
        .where(PosOrdHed.member == customer.cus_code)
        .order_by(PosOrdHed.created_at.desc())
    )
    orders = session.exec(stmt).all()
    return [_to_order_out(session, order, customer) for order in orders]


@router.get("/orders/{ord_no}", response_model=OrderOut)
def get_my_order(
    ord_no: str,
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    customer = _require_customer(session, current_user)

    order = session.get(PosOrdHed, ord_no)
    if not order or order.type not in (ORDER_TYPE_ONLINE, RETURN_ORDER_TYPE) or order.member != customer.cus_code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return _to_order_out(session, order, customer)


@router.get("/seller/orders", response_model=list[OrderOut])
def list_seller_orders(
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """Every online order, across all store locations and customers — the
    seller-side counterpart to a buyer's own order history above. Backs the
    seller order and payment management pages."""
    stmt = (
        select(PosOrdHed)
        .where(PosOrdHed.type == ORDER_TYPE_ONLINE)
        .order_by(PosOrdHed.created_at.desc())
    )
    orders = session.exec(stmt).all()

    results: list[OrderOut] = []
    for order in orders:
        customer = (
            session.exec(select(PosCustomer).where(PosCustomer.cus_code == order.member)).first()
            if order.member
            else None
        )
        results.append(_to_order_out(session, order, customer or PosCustomer()))
    return results


@router.get("/seller/orders/returns", response_model=list[OrderOut])
def list_seller_returns(
    session: Session = Depends(get_session),
):
    """Every return request across all customers — the store dashboard's
    refunding queue. Nested under /seller/orders so it reaches this service
    through the existing gateway route with no nginx changes."""
    stmt = (
        select(PosOrdHed)
        .where(PosOrdHed.type == RETURN_ORDER_TYPE)
        .order_by(PosOrdHed.created_at.desc())
    )
    orders = session.exec(stmt).all()

    results: list[OrderOut] = []
    for order in orders:
        customer = (
            session.exec(select(PosCustomer).where(PosCustomer.cus_code == order.member)).first()
            if order.member
            else None
        )
        results.append(_to_order_out(session, order, customer or PosCustomer()))
    return results


@router.post("/seller/orders/returns/{rtn_ord_no}/refund", response_model=OrderOut)
def refund_return(
    rtn_ord_no: str,
    body: RefundRequestBody = RefundRequestBody(),
    session: Session = Depends(get_session),
    current_user: TokenClaims = Depends(get_current_user),
):
    """Store-side action: marks a filed return as refunded and records it as a
    real invoice (pos_invhed/invdtl/invpay), same as a card sale is invoiced
    at checkout — except every amount here is negative, since this is money
    paid OUT to the buyer, not in. Without the negative sign, anything that
    sums these tables for revenue (reports, the external POS app) would count
    a refund as an additional sale. This is the only status transition a
    return ever makes (no approval/reject path). Stock is restocked here, at
    refund time, not when the return was first filed."""
    order = session.get(PosOrdHed, rtn_ord_no)
    if not order or order.type != RETURN_ORDER_TYPE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return not found")
    if order.status != OrderStatus.RETURNED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Return status is '{order.status.value}', expected 'returned'",
        )

    refund_paymode = session.get(PosPayMode, REFUND_METHOD_TO_PAY_CODE[body.method])
    if not refund_paymode:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Refund payment mode '{body.method}' is not configured",
        )

    card_type = body.cardType.strip() if body.cardType else None
    card_last_four = body.cardLastFour.strip() if body.cardLastFour else None
    if body.method == "card":
        if not card_type or not card_last_four or not card_last_four.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Card type and last 4 digits are required to refund via card",
            )

    lines = session.exec(
        select(PosOrdDtl).where(PosOrdDtl.OrdNo == rtn_ord_no, PosOrdDtl.cancel.isnot(True))
    ).all()

    now = datetime.utcnow()
    created_by_id = str(current_user.id) if current_user.id is not None else None
    net_amount = order.netamount or Decimal("0")

    # One try/except around stock + header + invoice, like place_order's own —
    # a colliding inv_no can surface at any point via autoflush, not just at
    # commit, so the whole attempt (including the stock adjustment) must roll
    # back and retry together rather than partially double-applying it.
    last_error: Optional[Exception] = None
    for _ in range(MAX_ORD_NO_ATTEMPTS):
        try:
            for line in lines:
                if line.itemcode and line.qty:
                    adjust_itemlots_stock(session, line.itemcode, line.storeId, sih_delta=line.qty)

            order.status = OrderStatus.REFUNDED
            order.payamount = net_amount
            order.dueamount = Decimal("0")
            order.is_invoiced = True
            order.md_at = now
            order.md_by_id = created_by_id

            inv_no = _generate_inv_no(session)
            order.InvNo = inv_no
            session.add(order)

            session.add(
                PosInvHed(
                    InvNo=inv_no,
                    created_at=now,
                    created_by_id=created_by_id,
                    storeId=order.storeId,
                    member=order.member,
                    pricemode=REFUND_METHOD_TO_PRICEMODE[body.method],
                    refno=rtn_ord_no,
                    grossamount=-net_amount,
                    netamount=-net_amount,
                    dueamount=Decimal("0"),
                    payamount=-net_amount,
                    cancel=False,
                )
            )
            for line in lines:
                sprice = line.sprice or Decimal("0")
                qty = line.qty or Decimal("0")
                session.add(
                    PosInvDtl(
                        InvNo=inv_no,
                        lineno=line.lineno,
                        created_at=now,
                        created_by_id=created_by_id,
                        storeId=line.storeId,
                        itemcode=line.itemcode,
                        qty=qty,
                        sprice=sprice,
                        amount=-(sprice * qty),
                        cancel=False,
                    )
                )
            session.add(
                PosInvPay(
                    Invno=inv_no,
                    paytype=refund_paymode.pay_code,
                    created_at=now,
                    created_by_id=created_by_id,
                    storeId=order.storeId,
                    paytypedesc=card_type if body.method == "card" else refund_paymode.pay_typedesc,
                    crdcardno=card_last_four if body.method == "card" else None,
                    payamt=-net_amount,
                    amount=-net_amount,
                    cancel=False,
                )
            )

            session.commit()
        except IntegrityError as exc:
            session.rollback()
            last_error = exc
            continue

        session.refresh(order)
        customer = (
            session.exec(select(PosCustomer).where(PosCustomer.cus_code == order.member)).first()
            if order.member
            else None
        )
        return _to_order_out(session, order, customer or PosCustomer())

    session.rollback()
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Failed to allocate an invoice number. Please try again.",
    ) from last_error
