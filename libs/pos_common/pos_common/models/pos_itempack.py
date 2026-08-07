"""Owned by: Packing service."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class PosItemPack(SQLModel, table=True):
    __tablename__ = "pos_itempack"

    itempack_id: Optional[int] = Field(default=None, primary_key=True)
    itempack_ordno: str = Field(max_length=7, nullable=False, index=True)
    itempack_loc: Optional[str] = Field(default=None, max_length=10, index=True)
    itempack_mddate: Optional[datetime] = Field(default=None)
    itempack_user: Optional[str] = Field(default=None, max_length=10)
    itempack_refno: Optional[str] = Field(default=None, max_length=10)
    itempack_mdby: Optional[str] = Field(default=None, max_length=10)
    itempack_Remark: Optional[str] = Field(default=None, max_length=255)
    itempack_pakagetype: Optional[str] = Field(default=None, max_length=50)
    itempack_weight: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itempack_dimenstion: Optional[str] = Field(default=None, max_length=50)
    itempack_confirm: bool = Field(default=False, nullable=False)
