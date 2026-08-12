from typing import Optional

from sqlmodel import Field, SQLModel


class PosStaff(SQLModel, table=True):
    __tablename__ = "pos_staff"

    id: int = Field(default=None, primary_key=True)
    name: str = Field(max_length=150)
    status: bool = Field(default=True, nullable=False)
