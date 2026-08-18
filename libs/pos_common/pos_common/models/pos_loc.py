from typing import Optional

from sqlalchemy import Boolean, Column, String
from sqlmodel import Field, SQLModel


class PosLoc(SQLModel, table=True):
    __tablename__ = "pos_loc"

    loc_code: Optional[str] = Field(default=None, sa_column=Column("Loc_Code", String(10), primary_key=True, quote=True))
    loc_desc: Optional[str] = Field(default=None, sa_column=Column("Loc_Desc", String(60), quote=True))
    loc_address: Optional[str] = Field(default=None, sa_column=Column("Loc_Address", String(200), quote=True))
    loc_active: Optional[bool] = Field(default=None, sa_column=Column("Loc_Active", Boolean, quote=True))
    loc_remote: Optional[bool] = Field(default=None, sa_column=Column("Loc_Remote", Boolean, quote=True))
