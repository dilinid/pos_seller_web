"""Owned by: external legacy POS application (item master). Shared-read only."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class PosItem(SQLModel, table=True):
    __tablename__ = "pos_item"

    item_id: Optional[int] = Field(default=None, primary_key=True, nullable=False)
    item_instituteid: Optional[int] = Field(default=None)
    item_crdate: Optional[datetime] = Field(default=None)
    item_crby: Optional[str] = Field(default=None, max_length=25)
    item_mddate: Optional[datetime] = Field(default=None)
    item_mdby: Optional[str] = Field(default=None, max_length=32)
    item_code: Optional[str] = Field(default=None, max_length=25, unique=True)
    item_autocode: Optional[str] = Field(default=None, max_length=25)
    item_name: Optional[str] = Field(default=None, max_length=60)
    item_webname: Optional[str] = Field(default=None, max_length=40)
    item_group1: Optional[str] = Field(default=None, max_length=10)
    item_group2: Optional[str] = Field(default=None, max_length=10)
    item_group3: Optional[str] = Field(default=None, max_length=10)
    item_uom: Optional[str] = Field(default=None, max_length=5)
    item_case: Optional[float] = Field(default=None)
    item_selling: Optional[float] = Field(default=None)
    item_cost: Optional[float] = Field(default=None)
    item_avgcost: Optional[float] = Field(default=None)
    item_gp: Optional[float] = Field(default=None)
    item_fixedgp: Optional[float] = Field(default=None)
    item_type: Optional[str] = Field(default=None, max_length=1)
    item_reordermin: Optional[float] = Field(default=None)
    item_reordermax: Optional[float] = Field(default=None)
    item_enablereorderalert: Optional[bool] = Field(default=None)
    item_lastpurchaseprice: Optional[float] = Field(default=None)
    item_shortdescription: Optional[str] = Field(default=None, max_length=25)
    item_barcode: Optional[str] = Field(default=None, max_length=15)
    item_qrcode: Optional[str] = Field(default=None, max_length=25)
    item_positem: Optional[bool] = Field(default=None)
    item_dirgrn: Optional[bool] = Field(default=None)
    item_hoprice: Optional[bool] = Field(default=None)
    item_vendorplu: Optional[str] = Field(default=None, max_length=30)
    item_active: Optional[bool] = Field(default=None)
    item_generagebatch: Optional[bool] = Field(default=None)
    item_allowstcode: Optional[bool] = Field(default=None)
    item_calreceipe: Optional[bool] = Field(default=None)
    item_rawitem: Optional[bool] = Field(default=None)
    item_activedis: Optional[bool] = Field(default=None)
    item_weighted: Optional[bool] = Field(default=None)
