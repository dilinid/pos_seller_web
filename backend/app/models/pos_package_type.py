from decimal import Decimal
from typing import Optional

from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class PosPackageType(SQLModel, table=True):
    __tablename__ = "pos_package_type"

    id: int = Field(default=None, primary_key=True)
    type: str = Field(max_length=100)
    length: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(10, 2))
    width: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(10, 2))
    height: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(10, 2))
    status: bool = Field(default=True, nullable=False)
