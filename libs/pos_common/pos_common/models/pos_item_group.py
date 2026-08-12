"""Owned by: external legacy POS application (item group reference data).
Shared-read only."""

from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class PosItemGroup(SQLModel, table=True):
    __tablename__ = "pos_item_group"

    group_id: Optional[int] = Field(default=None, primary_key=True, nullable=False)
    group_code: str = Field(max_length=3, nullable=False)
    group_name: str = Field(max_length=40, nullable=False)
    group_saccno: Optional[str] = Field(default=None, max_length=20, nullable=True)
    group_crat: Optional[datetime] = Field(default=None, nullable=True)
    group_crby: Optional[str] = Field(default=None, max_length=10, nullable=True)
    group_mdat: Optional[datetime] = Field(default=None, nullable=True)
    group_mdby: Optional[str] = Field(default=None, max_length=10, nullable=True)
    group_caccno: Optional[str] = Field(default=None, max_length=20, nullable=True)
    group_iaccno: Optional[str] = Field(default=None, max_length=20, nullable=True)
    group_prchadays: Optional[int] = Field(default=None, nullable=True)
