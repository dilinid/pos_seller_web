from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class PosInvPay(SQLModel, table=True):
    __tablename__ = "pos_invpay"

    Invno: str = Field(primary_key=True, max_length=20)
    paytype: str = Field(primary_key=True, max_length=3)
    created_at: datetime = Field(primary_key=True)
    created_by_id: Optional[str] = Field(default=None, max_length=32)
    updated_at: Optional[datetime] = Field(default=None)
    signondate: Optional[datetime] = Field(default=None)
    stationid: Optional[str] = Field(default=None, max_length=3)
    cashierid: Optional[str] = Field(default=None, max_length=10)
    storeId: Optional[str] = Field(default=None, max_length=10)
    paytypedesc: Optional[str] = Field(default=None, max_length=30)
    crdcardno: Optional[str] = Field(default=None, max_length=25)
    fcuramt: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    payamt: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    amount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    exchngrate: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 6))
    cancel: Optional[bool] = Field(default=False)
