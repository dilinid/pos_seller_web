"""Marketplace endpoints — fetch approved items from pos_itemlots with approved resources."""

import re

from fastapi import APIRouter, Depends
from sqlmodel import Session, select, text

from app.database import get_session
from app.models.pos_itemlots import PosItemLots
from app.models.pos_item_group import PosItemGroup
from app.models.pos_item_resource import PosItemResource

router = APIRouter()


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or value


@router.get("/api/marketplace/products")
def get_marketplace_products(session: Session = Depends(get_session)):
    """
    Return items from pos_itemlots that have at least one approved resource
    in pos_item_resources (is_approved = 1).
    """
    # Items that have at least one approved resource
    subq = (
        select(PosItemResource.resource_itemlots_code)
        .where(PosItemResource.is_approved == 1)
        .distinct()
        .subquery()
    )

    stmt = (
        select(PosItemLots)
        .where(PosItemLots.itemlots_code.in_(select(subq.c.resource_itemlots_code)))
        .where(PosItemLots.itemlots_active == True)
    )

    items = session.exec(stmt).all()

    # Build a lookup of approved resources per item
    resource_stmt = (
        select(PosItemResource)
        .where(PosItemResource.is_approved == 1)
    )
    all_resources = session.exec(resource_stmt).all()

    resources_by_code: dict[str, list[PosItemResource]] = {}
    for res in all_resources:
        resources_by_code.setdefault(res.resource_itemlots_code, []).append(res)

    # Transform to frontend-friendly format
    products = []
    for item in items:
        item_resources = resources_by_code.get(item.itemlots_code, [])
        # Sort by sort_order
        item_resources.sort(key=lambda r: (r.resource_sort_order or 0))

        images = [
            {
                "resource_path": r.resource_path,
                "resource_type": r.resource_type,
                "resource_title": r.resource_title,
            }
            for r in item_resources
            if r.resource_type in ("image", "video")
        ]

        first_image = images[0]["resource_path"] if images else None

        products.append(
            {
                "id": item.itemlots_code or "",
                "name": item.itemlots_desc or item.itemlots_code or "",
                "price": float(item.itemlots_selling) if item.itemlots_selling else 0,
                "mrp": None,  # No MRP in pos_itemlots
                "categoryId": item.itemlots_group or "",
                "subCategoryId": "",
                "sellerId": item.itemlots_vendor or "",
                "unit": item.itemlots_uom or "",
                "image": first_image,
                "images": [img["resource_path"] for img in images],
                "description": item.itemlots_desc or "",
                "rating": 0,
                "reviewCount": 0,
                "features": [],
                "specifications": {},
                "weight": float(item.itemlots_opqty) if item.itemlots_opqty else None,
                "volume": None,
                "code": item.itemlots_code or "",
                "barcode": item.itemlots_barcode or "",
                "stock": float(item.itemlots_sih) if item.itemlots_sih else 0,
                "cost": float(item.itemlots_cost) if item.itemlots_cost else 0,
            }
        )

    return products


@router.get("/api/marketplace/categories")
def get_marketplace_categories(session: Session = Depends(get_session)):
    """Return product categories sourced from pos_item_group."""
    stmt = select(PosItemGroup).order_by(PosItemGroup.group_name)
    groups = session.exec(stmt).all()

    return [
        {
            "id": group.group_code or str(group.group_id),
            "name": group.group_name,
            "slug": _slugify(group.group_code or group.group_name),
            "icon": "🏷️",
        }
        for group in groups
    ]