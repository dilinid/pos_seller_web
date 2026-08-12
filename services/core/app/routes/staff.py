"""Staff directory — lets the UI offer a picker/packer dropdown sourced from pos_staff."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models.it_user_master import ITUserMaster
from app.models.pos_staff import PosStaff
from app.routes.auth import get_current_user

router = APIRouter(prefix="/api/seller", tags=["staff"])


class StaffOut(BaseModel):
    id: int
    name: str


@router.get("/staff", response_model=list[StaffOut])
def list_staff(
    session: Session = Depends(get_session),
    current_user: ITUserMaster = Depends(get_current_user),
):
    stmt = select(PosStaff).where(PosStaff.status == True).order_by(PosStaff.name)  # noqa: E712
    staff = session.exec(stmt).all()
    return [StaffOut(id=s.id, name=s.name) for s in staff]
