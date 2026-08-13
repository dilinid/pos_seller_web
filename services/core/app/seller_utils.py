"""Small helpers shared by the seller fulfillment routes (pickup, packing)."""

from typing import Optional

from sqlmodel import Session, select

from app.models.it_user_master import ITUserMaster
from app.models.pos_customer import PosCustomer
from app.models.pos_staff import PosStaff


def get_customer_name(session: Session, member: Optional[str]) -> str:
    if not member:
        return "Walk-in Customer"
    customer = session.exec(select(PosCustomer).where(PosCustomer.cus_code == member)).first()
    return customer.cus_name if customer and customer.cus_name else member


def short_user_code(user: ITUserMaster) -> Optional[str]:
    """Fits the varchar(10) *_user/*_mdby columns used across pos_itempick/pos_itempack."""
    return str(user.id)[:10] if user.id is not None else None


def staff_code(staff: PosStaff) -> str:
    """Fits the varchar(10) *_user columns used to record the assigned picker/packer."""
    return str(staff.id)[:10]


def staff_display_name(session: Session, code: Optional[str]) -> Optional[str]:
    """Best-effort reverse lookup of a staff_code() back to the staff member's name."""
    if not code:
        return None
    try:
        staff_id = int(code)
    except ValueError:
        return code
    staff = session.get(PosStaff, staff_id)
    return staff.name if staff and staff.name else code
