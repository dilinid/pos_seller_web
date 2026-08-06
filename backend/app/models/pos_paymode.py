from typing import Optional

from sqlmodel import Field, SQLModel


class PosPayMode(SQLModel, table=True):
    __tablename__ = "pos_paymode"

    pay_code: str = Field(primary_key=True, max_length=3)
    pay_typedesc: Optional[str] = Field(default=None, max_length=30)
    pay_iscredit: Optional[bool] = Field(default=None)
    pay_accno: Optional[str] = Field(default=None, max_length=20)
    pay_iscash: Optional[int] = Field(default=0)
