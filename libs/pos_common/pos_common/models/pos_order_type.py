"""Owned by: external legacy POS application (order type reference data).
Shared-read only — pos_ordhed.type has an FK to this table."""

from sqlmodel import Field, SQLModel


class PosOrderType(SQLModel, table=True):
    __tablename__ = "pos_order_type"

    id: int = Field(primary_key=True, nullable=False)
    type_code: str = Field(max_length=20, nullable=False, unique=True)
    type_name: str = Field(max_length=100, nullable=False)
    status: bool = Field(default=True, nullable=False)
