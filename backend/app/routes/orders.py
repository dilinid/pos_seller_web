"""Marketplace order endpoints — place orders and let a buyer read back their
own order history, backed by the real pos_ordhed/pos_orddtl rows. Order type
'ONL' distinguishes these from in-store POS orders ('POS')."""

from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.database import get_session
from app.models.it_user_master import ITUserMaster
from app.models.pos_customer import PosCustomer
from app.models.pos_invdtl import PosInvDtl
from app.models.pos_invhed import PosInvHed
from app.models.pos_invpay import PosInvPay
from app.models.pos_item_resource import PosItemResource
from app.models.pos_itemlots import PosItemLots
from app.models.pos_orddtl import PosOrdDtl
from app.models.pos_ordhed import OrderStatus, PosOrdHed
from app.models.pos_paymode import PosPayMode
from app.routes.auth import get_current_user
from app.seller_utils import get_store_id

router = APIRouter(prefix="/api/marketplace", tags=["orders"])

ORDER_TYPE_ONLINE = "ONL"
ORD_NO_PREFIX = "O"
ORD_NO_DIGITS = 6  # prefix + digits fills the 7-char OrdNo column
MAX_ORD_NO_ATTEMPTS = 5

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


class PlaceOrderResponse(BaseModel):
    ordNo: str
    status: str
    createdAt: str


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


# ── helpers ──────────────────────────────────────────────────────────────────


def _require_customer(session: Session, current_user: ITUserMaster) -> PosCustomer:
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


def _to_order_out(session: Session, order: PosOrdHed, customer: PosCustomer) -> OrderOut:
    lines = session.exec(
        select(PosOrdDtl)
        # `cancel != True` excludes NULL rows under SQL's three-valued logic (NULL != True
        # is NULL, not true) — isnot(True) correctly keeps both NULL and False as "active".
        .where(PosOrdDtl.OrdNo == order.OrdNo, PosOrdDtl.cancel.isnot(True))
        .order_by(PosOrdDtl.lineno)
    ).all()

    delivery_method: Literal["delivery", "pickup"] = "delivery" if order.ordaddress else "pickup"
    total_fee = float(order.addamount) if order.addamount is not None else 0.0

    items: list[OrderItemOut] = []
    for idx, line in enumerate(lines):
        lot = None
        if line.itemcode:
            lot_stmt = select(PosItemLots).where(PosItemLots.itemlots_code == line.itemcode)
            if line.storeId:
                lot_stmt = lot_stmt.where(PosItemLots.itemlots_loc == line.storeId)
            lot = session.exec(lot_stmt).first()

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
            )
        )

    net_amount = order.netamount if order.netamount is not None else Decimal("0")
    pay_amount = order.payamount if order.payamount is not None else Decimal("0")
    payment_status: Literal["pending", "paid"] = "paid" if pay_amount >= net_amount and net_amount > 0 else "pending"

    payment_method = PRICEMODE_TO_PAYMENT_METHOD.get(order.pricemode or "", "card")

    return OrderOut(
        id=order.OrdNo,
        createdAt=order.created_at.isoformat() if order.created_at else "",
        updatedAt=(order.md_at or order.created_at).isoformat() if (order.md_at or order.created_at) else "",
        items=items,
        buyerName=customer.cus_name or "Unknown",
        buyerPhone=customer.cus_tep1,
        buyerEmail=customer.cus_email,
        deliveryAddress=order.ordaddress or "",
        deliveryDistrict="",
        orderNotes="",
        paymentMethod=payment_method,
        paymentStatus=payment_status,
        grandTotal=float(net_amount),
        estimatedDelivery=ESTIMATED_DELIVERY,
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


# ── endpoints ────────────────────────────────────────────────────────────────


@router.post("/orders", response_model=PlaceOrderResponse, status_code=status.HTTP_201_CREATED)
def place_order(
    body: PlaceOrderRequest,
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
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

    store_id = get_store_id(session)
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
        try:
            session.flush()
        except IntegrityError as exc:
            session.rollback()
            last_error = exc
            continue

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

        try:
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


@router.get("/orders", response_model=list[OrderOut])
def list_my_orders(
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
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


@router.get("/orders/{ord_no}", response_model=OrderOut)
def get_my_order(
    ord_no: str,
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    customer = _require_customer(session, current_user)

    order = session.get(PosOrdHed, ord_no)
    if not order or order.type != ORDER_TYPE_ONLINE or order.member != customer.cus_code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return _to_order_out(session, order, customer)


@router.get("/seller/orders", response_model=list[OrderOut])
def list_seller_orders(
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    """Every online order for this store, across all customers — the seller-side
    counterpart to a buyer's own order history above. Backs the seller order and
    payment management pages."""
    store_id = get_store_id(session)

    stmt = select(PosOrdHed).where(PosOrdHed.type == ORDER_TYPE_ONLINE)
    if store_id:
        stmt = stmt.where(PosOrdHed.storeId == store_id)
    stmt = stmt.order_by(PosOrdHed.created_at.desc())
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
