"""Atomic pos_itemlots stock adjustments shared by Ordering/Picking/Packing.

pos_itemlots is the external legacy POS application's inventory-lot table (one
row per item+location) — every fulfillment service already reads it directly.
Three of them also write specific columns here as part of the reserve -> pick
-> stock-on-hand handoff for online orders:

- Ordering increments itemlots_reserve when an order is placed.
- Picking moves that reservation into itemlots_pick when a pick is confirmed
  (itemlots_pick += qtyPicked, itemlots_reserve -= qtyPicked).
- Packing removes the picked stock from itemlots_sih when an order is marked
  packed & ready (itemlots_sih -= qtyPicked, itemlots_pick -= qtyPicked).

Packing and Picking both apply *their own order's* picked quantity, never the
lot's current itemlots_pick total — pos_itemlots is shared across every
in-flight order for that item, so two orders being picked/packed around the
same time must not clobber each other's numbers.

Each adjustment row-locks the matching lot (SELECT ... FOR UPDATE) for the
rest of the caller's transaction, so a concurrent request against the same lot
serializes behind it instead of losing an update — deltas are added in Python
after the lock is held, then flushed by the caller's own session.commit().
"""

from decimal import Decimal
from typing import Optional

from sqlmodel import Session, select

from pos_common.models.pos_itemlots import PosItemLots


def adjust_itemlots_stock(
    session: Session,
    item_code: str,
    store_id: Optional[str],
    *,
    reserve_delta: Decimal = Decimal("0"),
    pick_delta: Decimal = Decimal("0"),
    sih_delta: Decimal = Decimal("0"),
) -> bool:
    """Applies the given deltas (negative to subtract) to the pos_itemlots row
    matching item_code/store_id. Returns False and does nothing if no such lot
    exists — pos_itemlots is external data that can be out of sync with an
    order, and that's not this caller's problem to raise an error over.

    Does not commit; the caller's own session.commit() persists this alongside
    whatever else it's writing in the same request.
    """
    if not reserve_delta and not pick_delta and not sih_delta:
        return True

    stmt = select(PosItemLots).where(PosItemLots.itemlots_code == item_code)
    if store_id:
        stmt = stmt.where(PosItemLots.itemlots_loc == store_id)
    lot = session.exec(stmt.with_for_update()).first()
    if lot is None:
        return False

    if reserve_delta:
        lot.itemlots_reserve = (lot.itemlots_reserve or Decimal("0")) + reserve_delta
    if pick_delta:
        lot.itemlots_pick = (lot.itemlots_pick or Decimal("0")) + pick_delta
    if sih_delta:
        lot.itemlots_sih = (lot.itemlots_sih or Decimal("0")) + sih_delta

    session.add(lot)
    return True
