"""Owned by: external legacy POS application (inventory lots). Shared-read
only — every service that displays an item name/uom/location reads this."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class PosItemLots(SQLModel, table=True):
    __tablename__ = "pos_itemlots"

    itemlots_id: int = Field(default=None, primary_key=True, nullable=False)
    itemlots_code: Optional[str] = Field(default=None, max_length=25)
    itemlots_lot: Optional[str] = Field(default=None, max_length=25)
    itemlots_loc: Optional[str] = Field(default=None, max_length=10)
    itemlots_desc: Optional[str] = Field(default=None, max_length=40)
    itemlots_selling: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemlots_cost: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemlots_active: Optional[bool] = Field(default=None)
    itemlots_crdate: Optional[datetime] = Field(default=None)
    itemlots_crby: Optional[str] = Field(default=None, max_length=10)
    itemlots_mddate: Optional[datetime] = Field(default=None)
    itemlots_mdby: Optional[str] = Field(default=None, max_length=10)
    itemlots_opqty: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemlots_sih: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemlots_vendor: Optional[str] = Field(default=None, max_length=8)
    itemlots_lastpurdate: Optional[datetime] = Field(default=None)
    itemlots_lastselldate: Optional[datetime] = Field(default=None)
    itemlots_barcode: Optional[str] = Field(default=None, max_length=25)
    itemlots_group: Optional[str] = Field(default=None, max_length=10)
    itemlots_stockcode: Optional[str] = Field(default=None, max_length=25)
    itemlots_uom: Optional[str] = Field(default=None, max_length=5)
    itemlots_avgcost: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemlots_casesize: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemlots_reserve: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemlots_pick: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
