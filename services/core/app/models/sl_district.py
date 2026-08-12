from typing import Optional

from sqlmodel import Field, SQLModel


class SlDistrict(SQLModel, table=True):
    """Sri Lanka districts — seeded once from openadmindata.org (UN OCHA COD-AB),
    id values match that source's codes (e.g. "LK11")."""

    __tablename__ = "sl_district"

    id: str = Field(primary_key=True, max_length=10)
    name_en: str = Field(max_length=100)
    name_local: Optional[str] = Field(default=None, max_length=100)
    province_id: Optional[str] = Field(default=None, max_length=10)
    province_name_en: Optional[str] = Field(default=None, max_length=100)
