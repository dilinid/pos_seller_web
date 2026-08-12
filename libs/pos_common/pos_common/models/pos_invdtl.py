"""Owned by: Ordering service (card-payment invoicing at checkout)."""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class PosInvDtl(SQLModel, table=True):
    __tablename__ = "pos_invdtl"

    InvNo: str = Field(primary_key=True, max_length=20)
    lineno: int = Field(primary_key=True)
    created_at: Optional[datetime] = Field(default=None)
    created_by_id: Optional[str] = Field(default=None, max_length=32)
    md_at: Optional[datetime] = Field(default=None)
    md_by_id: Optional[str] = Field(default=None, max_length=32)
    updated_at: Optional[datetime] = Field(default=None)
    storeId: Optional[str] = Field(default=None, max_length=10)
    itemcode: Optional[str] = Field(default=None, max_length=16)
    qty: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    sprice: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    avgcost: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    cprice: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    linedisval: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    promodisper: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    promodisamt: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    amount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    stockcode: Optional[str] = Field(default=None, max_length=16)
    cashierId: Optional[str] = Field(default=None, max_length=10)
    billdisper: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    billpromodisper: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    org_sprice: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    cancel: Optional[bool] = Field(default=None)
