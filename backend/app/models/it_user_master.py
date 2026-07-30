from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class ITUserMaster(SQLModel, table=True):
    __tablename__ = "it_user_master"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_group_id: Optional[int] = Field(default=None)
    customer_id: Optional[int] = Field(default=None)
    active_branch_id: Optional[str] = Field(default=None, max_length=10)
    name: Optional[str] = Field(default=None, max_length=300)
    user_name: Optional[str] = Field(default=None, max_length=50)
    password: Optional[str] = Field(default=None, max_length=500)
    password_old1: Optional[str] = Field(default=None, max_length=500)
    password_od2: Optional[str] = Field(default=None, max_length=500)
    ref_number: Optional[str] = Field(default=None, max_length=11)
    password_status: Optional[int] = Field(default=None)
    report_status: Optional[int] = Field(default=None)
    status: Optional[int] = Field(default=None)
    c_at: Optional[datetime] = Field(default=None)
    c_by: Optional[int] = Field(default=None)
    m_at: Optional[datetime] = Field(default=None)
    m_by: Optional[int] = Field(default=None)
    user_role: Optional[str] = Field(default="CLERK")
    transaction_allowance: Optional[str] = Field(default=None)
    stationid: Optional[str] = Field(default=None, max_length=50)
    signon: Optional[int] = Field(default=None)
    signondate: Optional[datetime] = Field(default=None)
    signontime: Optional[datetime] = Field(default=None)
    shiftno: Optional[int] = Field(default=None)
    floatamt: Optional[float] = Field(default=None)
    signoff: Optional[int] = Field(default=None)
    signoffdate: Optional[datetime] = Field(default=None)
    signofftime: Optional[datetime] = Field(default=None)
