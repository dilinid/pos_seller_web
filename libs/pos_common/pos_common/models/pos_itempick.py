"""Owned by: Picking service."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class PosItemPick(SQLModel, table=True):
    __tablename__ = "pos_itempick"

    itempick_id: Optional[int] = Field(default=None, primary_key=True)
    itempick_ordno: str = Field(max_length=7, nullable=False, index=True)
    itempick_loc: Optional[str] = Field(default=None, max_length=10, index=True)
    itempick_mddate: Optional[datetime] = Field(default=None)
    itempick_user: Optional[str] = Field(default=None, max_length=10)
    itempick_Refno: Optional[str] = Field(default=None, max_length=10)
    itempick_mdby: Optional[str] = Field(default=None, max_length=10)
    itempick_Remark: Optional[str] = Field(default=None, max_length=255)
    itempick_confirm: bool = Field(default=False, nullable=False)
