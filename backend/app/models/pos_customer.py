from datetime import datetime
from typing import Optional
from sqlmodel import Field, Relationship, SQLModel

from app.models.pos_customer_group import PosCustomerGroup


class PosCustomer(SQLModel, table=True):
    __tablename__ = "pos_customer"

    cus_id: Optional[int] = Field(default=None, primary_key=True)
    cus_code: Optional[str] = Field(default=None, max_length=32)
    cus_name: Optional[str] = Field(default=None, max_length=60)
    cus_title: Optional[str] = Field(default=None, max_length=10)
    cus_accno: Optional[str] = Field(default=None, max_length=20)
    cus_crdate: Optional[datetime] = Field(default=None)
    cus_crby: Optional[str] = Field(default=None, max_length=32)
    cus_mddate: Optional[datetime] = Field(default=None)
    cus_mdby: Optional[str] = Field(default=None, max_length=32)
    cus_groupid: Optional[int] = Field(default=None, foreign_key="pos_customer_group.id")
    cus_active: Optional[bool] = Field(default=True)
    cus_add1: Optional[str] = Field(default=None, max_length=40)
    cus_add2: Optional[str] = Field(default=None, max_length=40)
    cus_add3: Optional[str] = Field(default=None, max_length=40)
    cus_add4: Optional[str] = Field(default=None, max_length=40)
    cus_tep1: Optional[str] = Field(default=None, max_length=30)
    cus_tep2: Optional[str] = Field(default=None, max_length=30)
    cus_email: Optional[str] = Field(default=None, max_length=40)
    cus_dob: Optional[datetime] = None
    cus_prof: Optional[str] = Field(default=None, max_length=40)
    cus_spouse: Optional[str] = Field(default=None, max_length=40)
    cus_creditlimit: Optional[float] = None
    cus_creditperiod: Optional[float] = None
    cus_opbal: Optional[float] = None
    cus_purchase: Optional[float] = None
    cus_returns: Optional[float] = None
    cus_creditnote: Optional[float] = None
    cus_debitnote: Optional[float] = None
    cus_payment: Optional[float] = None
    cus_balance: Optional[float] = None
    cus_loyaltyactive: Optional[bool] = None
    cus_openpoint: Optional[float] = None
    cus_earnepoint: Optional[float] = None
    cus_redeempoint: Optional[float] = None
    cus_points: Optional[float] = None

    customer_group: Optional["PosCustomerGroup"] = Relationship(back_populates="customers")
