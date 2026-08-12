from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.pos_customer import PosCustomer


class PosCustomerGroup(SQLModel, table=True):
    __tablename__ = "pos_customer_group"

    id: int = Field(default=None, primary_key=True)
    group_name: str = Field(max_length=50)
    group_description: Optional[str] = Field(default=None, max_length=255)
    active: bool = Field(default=True, nullable=False)
    group_crby: Optional[int] = Field(default=None)
    group_crat: Optional[datetime] = Field(default=None)
    group_mdby: Optional[int] = Field(default=None)
    group_mdat: Optional[datetime] = Field(default=None)

    customers: list["PosCustomer"] = Relationship(back_populates="customer_group")