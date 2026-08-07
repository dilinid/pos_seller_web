"""Owned by: Marketplace/Catalog service (folded into Core in Phase 1) — item
image/video approvals. Shared-read by Ordering for product thumbnails."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class PosItemResource(SQLModel, table=True):
    __tablename__ = "pos_item_resources"

    resource_id: Optional[int] = Field(default=None, primary_key=True, nullable=False)
    resource_itemlots_code: str = Field(max_length=25, nullable=False)
    resource_type: str = Field(max_length=10, nullable=False)
    resource_path: str = Field(max_length=512, nullable=False)
    resource_sort_order: Optional[int] = Field(default=None, nullable=True)
    resource_title: Optional[str] = Field(default=None, max_length=100, nullable=True)
    resource_crdate: Optional[datetime] = Field(default=None, nullable=True)
    resource_crby: Optional[str] = Field(default=None, max_length=10, nullable=True)
    resource_mddate: Optional[datetime] = Field(default=None, nullable=True)
    resource_mdby: Optional[str] = Field(default=None, max_length=10, nullable=True)
    is_approved: Optional[int] = Field(default=0, nullable=False)
    is_primary: Optional[int] = Field(default=0, nullable=False)
