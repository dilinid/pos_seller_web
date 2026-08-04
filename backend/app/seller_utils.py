"""Small helpers shared by the seller fulfillment routes (pickup, packing)."""

from typing import Optional

from sqlmodel import Session, select

from app.models.it_user_master import ITUserMaster
from app.models.pos_customer import PosCustomer
from app.models.pos_setup import PosSetup


def get_store_id(session: Session) -> Optional[str]:
    setup = session.exec(select(PosSetup)).first()
    return setup.setup_storeid if setup else None


def get_customer_name(session: Session, member: Optional[str]) -> str:
    if not member:
        return "Walk-in Customer"
    customer = session.exec(select(PosCustomer).where(PosCustomer.cus_code == member)).first()
    return customer.cus_name if customer and customer.cus_name else member


def short_user_code(user: ITUserMaster) -> Optional[str]:
    """Fits the varchar(10) *_user/*_mdby columns used across pos_itempick/pos_itempack."""
    return str(user.id)[:10] if user.id is not None else None


def user_display_name(session: Session, code: Optional[str]) -> Optional[str]:
    """Best-effort reverse lookup of a short_user_code() back to a friendly name."""
    if not code:
        return None
    try:
        user_id = int(code)
    except ValueError:
        return code
    user = session.get(ITUserMaster, user_id)
    return user.name if user and user.name else code
