"""Owned by: Core (location) service. Reference data, shared-read elsewhere."""

from typing import Optional

from sqlmodel import Field, SQLModel

from pos_common.models.sl_ds_division import SlDsDivision  # noqa: F401 — must be imported so SQLModel.metadata has sl_ds_division registered before this table's FK is resolved


class SlGnDivision(SQLModel, table=True):
    """Sri Lanka Grama Niladhari divisions — seeded once from openadmindata.org
    (UN OCHA COD-AB), id values match that source's codes (e.g. "LK1103005")."""

    __tablename__ = "sl_gn_division"

    id: str = Field(primary_key=True, max_length=15)
    name_en: str = Field(max_length=100)
    name_local: Optional[str] = Field(default=None, max_length=100)
    ds_division_id: str = Field(max_length=15, foreign_key="sl_ds_division.id")
