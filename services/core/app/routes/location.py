"""Sri Lanka administrative-division lookups — District / Divisional Secretariat /
Grama Niladhari Division. Data is seeded once from openadmindata.org (UN OCHA
COD-AB) via scripts/seed_sl_divisions.py, not fetched live from that service."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models.pos_loc import PosLoc
from app.models.sl_district import SlDistrict
from app.models.sl_ds_division import SlDsDivision
from app.models.sl_gn_division import SlGnDivision

router = APIRouter(prefix="/api/location", tags=["location"])


class DivisionOut(BaseModel):
    id: str
    name: str


class StoreLocationOut(BaseModel):
    code: str
    name: str


@router.get("/stores", response_model=list[StoreLocationOut])
def list_store_locations(session: Session = Depends(get_session)):
    """Active pos_loc rows a buyer/seller can pick as "which store" an order is
    placed against — ordered by code so the frontend's "first row is the
    default" behavior is deterministic."""
    stmt = (
        select(PosLoc)
        .where(PosLoc.loc_active == True)  # noqa: E712
        .where(PosLoc.loc_code.isnot(None))
        .order_by(PosLoc.loc_code)
    )
    return [StoreLocationOut(code=loc.loc_code, name=loc.loc_desc or loc.loc_code) for loc in session.exec(stmt)]


@router.get("/districts", response_model=list[DivisionOut])
def list_districts(session: Session = Depends(get_session)):
    stmt = select(SlDistrict).order_by(SlDistrict.name_en)
    return [DivisionOut(id=d.id, name=d.name_en) for d in session.exec(stmt)]


@router.get("/districts/{district_id}/ds-divisions", response_model=list[DivisionOut])
def list_ds_divisions(district_id: str, session: Session = Depends(get_session)):
    stmt = (
        select(SlDsDivision)
        .where(SlDsDivision.district_id == district_id)
        .order_by(SlDsDivision.name_en)
    )
    return [DivisionOut(id=d.id, name=d.name_en) for d in session.exec(stmt)]


@router.get("/ds-divisions/{ds_division_id}/gn-divisions", response_model=list[DivisionOut])
def list_gn_divisions(ds_division_id: str, session: Session = Depends(get_session)):
    stmt = (
        select(SlGnDivision)
        .where(SlGnDivision.ds_division_id == ds_division_id)
        .order_by(SlGnDivision.name_en)
    )
    return [DivisionOut(id=d.id, name=d.name_en) for d in session.exec(stmt)]
