"""Owned by: Packing service. Written from the order packing page's Delivery
Details panel (Agent / Agent Contact / Vehicle No / etc.)."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class PosItemDeliver(SQLModel, table=True):
    __tablename__ = "pos_itemdeliver"

    itemdeliver_id: Optional[int] = Field(default=None, primary_key=True)
    itemdeliver_ordno: str = Field(max_length=7, nullable=False)
    itemdeliver_loc: Optional[str] = Field(default=None, max_length=10)
    itemdeliver_mddate: Optional[datetime] = Field(default=None)
    itemdeliver_user: Optional[str] = Field(default=None, max_length=10)
    itemdeliver_agent: Optional[str] = Field(default=None, max_length=50)
    itemdeliver_agentcontact: Optional[str] = Field(default=None, max_length=20)
    itemdeliver_refno: Optional[str] = Field(default=None, max_length=10)
    itemdeliver_cusphone: Optional[str] = Field(default=None, max_length=20)
    itemdeliver_vehicle: Optional[str] = Field(default=None, max_length=50)
    itemdeliver_mdby: Optional[str] = Field(default=None, max_length=10)
    itemdeliver_remark: Optional[str] = Field(default=None, max_length=255)
    itemdeliver_estimatedays: Optional[int] = Field(default=None)
