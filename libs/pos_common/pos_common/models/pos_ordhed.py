from datetime import datetime
from decimal import Decimal
from enum import Enum as PyEnum
from typing import Optional

from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class OrderStatus(str, PyEnum):
    PENDING = "pending"
    PICKING = "picking"
    PACKING = "packing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
    REFUNDED = "refunded"


class PosOrdHed(SQLModel, table=True):
    __tablename__ = "pos_ordhed"

    OrdNo: str = Field(primary_key=True, max_length=7)
    type: str = Field(default="POS", max_length=20, foreign_key="pos_order_type.type_code")
    is_invoiced: bool = Field(default=False)
    InvNo: Optional[str] = Field(default=None, max_length=7)
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    created_at: Optional[datetime] = Field(default=None)
    created_by_id: Optional[str] = Field(default=None, max_length=32)
    md_at: Optional[datetime] = Field(default=None)
    md_by_id: Optional[str] = Field(default=None, max_length=32)
    updated_at: Optional[datetime] = Field(default=None)
    signondate: Optional[datetime] = Field(default=None)
    setupstoreid: Optional[str] = Field(default=None, max_length=10)
    storeId: Optional[str] = Field(default=None, max_length=10)
    stationid: Optional[str] = Field(default=None, max_length=3)
    cashierid: Optional[str] = Field(default=None, max_length=10)
    shiftno: Optional[int] = Field(default=None)
    member: Optional[str] = Field(default=None, max_length=10)
    ordaddress: Optional[str] = Field(default=None, max_length=200)
    rep: Optional[str] = Field(default=None, max_length=10)
    pricemode: Optional[str] = Field(default=None, max_length=5)
    refno: Optional[str] = Field(default=None, max_length=10)
    grossamount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    itemvisedis: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    disper: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    disamt: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    promodisc: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    addamount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    netamount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    dueamount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    payamount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    change_amount: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    gvsaleInv: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 0))
    starttime: Optional[datetime] = Field(default=None)
    pointsadded: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    pointsdeduct: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    cancel: Optional[bool] = Field(default=None)
    canuser: Optional[str] = Field(default=None, max_length=10)
    candate: Optional[datetime] = Field(default=None)
    cantime: Optional[datetime] = Field(default=None)
