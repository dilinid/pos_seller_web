"""Internal API for order-state mutations triggered by other services'
workflows — currently just Picking's print/confirm actions (see the plan's
"resolving the transactional coupling" section for why this replaced the old
monolith's single-transaction write across pos_itempick + pos_ordhed/pos_orddtl).

Never exposed through the gateway — gateway/nginx.conf has no location for
/internal/*, so this is reachable only via the Docker network (service-to-
service), never from a browser.

Status transitions use compare-and-swap (`expectedCurrentStatus`) so a retried
call can't blindly reapply/regress state. This does NOT make the caller's
overall operation idempotent across a lost response — see the plan's risk
notes for the accepted residual failure window.

This is the same contract the monolith's temporary backend/app/routes/
internal_orders.py implemented during Step 3 of the migration (Picking calling
this router while it still lived on the monolith) — moved here verbatim now
that Ordering is its own service, so Picking's ORDERING_SERVICE_URL is simply
repointed at this container with no code change on Picking's side.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from pos_common.auth import require_internal_token
from pos_common.database import get_session
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed

router = APIRouter(
    prefix="/internal/orders",
    tags=["internal"],
    dependencies=[Depends(require_internal_token)],
)


class UpdateStatusRequest(BaseModel):
    status: OrderStatus
    expectedCurrentStatus: OrderStatus


class PickQuantityItem(BaseModel):
    lineno: int
    qtyPicked: float


class UpdatePickQuantitiesRequest(BaseModel):
    items: list[PickQuantityItem]


def _get_order_or_404(session: Session, ord_no: str) -> PosOrdHed:
    order = session.get(PosOrdHed, ord_no)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order


@router.patch("/{ord_no}/status")
def update_order_status(
    ord_no: str,
    body: UpdateStatusRequest,
    session: Session = Depends(get_session),
):
    order = _get_order_or_404(session, ord_no)
    if order.status != body.expectedCurrentStatus:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Order status is '{order.status.value}', expected '{body.expectedCurrentStatus.value}'",
        )
    order.status = body.status
    session.add(order)
    session.commit()
    return {"ordNo": order.OrdNo, "status": order.status.value}


@router.patch("/{ord_no}/pick-quantities")
def update_pick_quantities(
    ord_no: str,
    body: UpdatePickQuantitiesRequest,
    session: Session = Depends(get_session),
):
    order = _get_order_or_404(session, ord_no)
    lines_by_no = {
        line.lineno: line
        for line in session.exec(select(PosOrdDtl).where(PosOrdDtl.OrdNo == ord_no)).all()
    }
    for item in body.items:
        line = lines_by_no.get(item.lineno)
        if line is None:
            continue
        line.pickqty = item.qtyPicked
        session.add(line)
    session.commit()
    return {"ordNo": order.OrdNo, "updated": len(body.items)}
