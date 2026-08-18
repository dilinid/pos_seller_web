"""Store/company identity from the shared pos_setup table (name, address, phone,
logo). Owned by the external legacy POS application — shared-read only, same
convention as location.py's pos_loc reads."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models.pos_setup import PosSetup

router = APIRouter(prefix="/api/store", tags=["store"])


class StoreProfileOut(BaseModel):
    name: str
    address: str
    phone: str
    logo: str | None = None


@router.get("/profile", response_model=StoreProfileOut)
def get_store_profile(session: Session = Depends(get_session)):
    """The single pos_setup row's public-facing identity fields."""
    setup = session.exec(select(PosSetup)).first()
    if not setup:
        return StoreProfileOut(name="", address="", phone="")
    return StoreProfileOut(
        name=setup.setup_comname or "",
        address=setup.setup_comaddress or "",
        phone=setup.setup_comtele or "",
        logo=setup.setup_comlogo,
    )
