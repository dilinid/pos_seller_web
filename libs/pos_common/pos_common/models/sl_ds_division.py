"""Owned by: Core (location) service. Reference data, shared-read elsewhere."""

from typing import Optional

from sqlmodel import Field, SQLModel

from pos_common.models.sl_district import SlDistrict  # noqa: F401 — must be imported so SQLModel.metadata has sl_district registered before this table's FK is resolved


class SlDsDivision(SQLModel, table=True):
    """Sri Lanka Divisional Secretariat divisions — seeded once from openadmindata.org
    (UN OCHA COD-AB), id values match that source's codes (e.g. "LK1103")."""

    __tablename__ = "sl_ds_division"

    id: str = Field(primary_key=True, max_length=15)
    name_en: str = Field(max_length=100)
    name_local: Optional[str] = Field(default=None, max_length=100)
    district_id: str = Field(max_length=10, foreign_key="sl_district.id")
