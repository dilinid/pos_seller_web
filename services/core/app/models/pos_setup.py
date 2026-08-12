from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class PosSetup(SQLModel, table=True):
    __tablename__ = "pos_setup"

    id: str = Field(primary_key=True, max_length=32)
    setup_orders: Optional[bool] = Field(default=None)
    setup_comname: Optional[str] = Field(default=None, max_length=255)
    setup_comaddress: Optional[str] = Field(default=None, max_length=255)
    setup_comtele: Optional[str] = Field(default=None, max_length=30)
    setup_comlogo: Optional[str] = Field(default=None)
    setup_storeid: Optional[str] = Field(default=None, max_length=10)
    setup_allowminus: bool = Field(default=False, nullable=False)
    setup_invnotes: Optional[str] = Field(default=None, max_length=255)
    setup_tax: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(5, 2))
    setup_vatacc: Optional[str] = Field(default=None, max_length=20)
    setup_vatexpacc: Optional[str] = Field(default=None, max_length=20)
    setup_pointscheme: Optional[int] = Field(default=None)
