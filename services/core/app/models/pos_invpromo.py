from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import DECIMAL
from sqlmodel import Field, SQLModel


class PosInvPromo(SQLModel, table=True):
    __tablename__ = "pos_invpromo"

    invpromo_id: Optional[int] = Field(default=None, primary_key=True, max_length=11)
    invpromo_InvNo: str = Field(max_length=20, description="FK to pos_invhed.InvNo")
    invpromo_loc: str = Field(max_length=10, description="FK to pos_loc.loc_code")
    invpromo_promoid: int = Field(max_length=11, description="FK to pos_promohed.id")
    invpromo_promoitem: Optional[str] = Field(default=None, max_length=25, description="FK to pos_item.item_code")
    invpromo_disper: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    invpromo_disamt: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    invpromo_offeritem: Optional[str] = Field(default=None, max_length=50)
    invpromo_offerqty: Optional[Decimal] = Field(default=None, sa_type=DECIMAL(18, 2))
    invpromo_crat: Optional[datetime] = Field(default=None)
    invpromo_crby: Optional[int] = Field(default=None, max_length=11)
