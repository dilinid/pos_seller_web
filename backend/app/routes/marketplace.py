"""Marketplace endpoints — fetch approved items from pos_itemlots with approved resources."""

import re

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models.pos_itemlots import PosItemLots
from app.models.pos_item_group import PosItemGroup
from app.models.pos_item_resource import PosItemResource

router = APIRouter()

# pos_itemlots holds one row per (item, store location) lot. The marketplace shows a
# single listing per item code, sourced from this location's lot.
PREFERRED_LOCATION = "LC001"


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or value


def _resource_url(resource_path: str) -> str:
    """Build a servable URL for a resource_path stored as e.g. 'uploads/image/foo.png'."""
    if resource_path.startswith(("http://", "https://", "/")):
        return resource_path
    return f"/{resource_path}"


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

    all_lots = session.exec(stmt).all()

    # Collapse per-location lots into a single representative row per item code.
    lots_by_code: dict[str, list[PosItemLots]] = {}
    for lot in all_lots:
        lots_by_code.setdefault(lot.itemlots_code, []).append(lot)

    items = [
        next((lot for lot in lots if lot.itemlots_loc == PREFERRED_LOCATION), lots[0])
        for lots in lots_by_code.values()
    ]

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
        # Sort by sort_order (unset sort_order sinks to the end)
        item_resources.sort(
            key=lambda r: (r.resource_sort_order is None, r.resource_sort_order or 0)
        )

        media_resources = [r for r in item_resources if r.resource_type in ("image", "video")]
        photo_resources = [r for r in media_resources if r.resource_type == "image"]

        # The card thumbnail must be the resource flagged is_primary=1; fall back to the
        # first approved photo (by sort order) if none is explicitly marked primary.
        primary_resource = next((r for r in photo_resources if r.is_primary == 1), None)
        thumbnail_resource = primary_resource or (photo_resources[0] if photo_resources else None)
        first_image = _resource_url(thumbnail_resource.resource_path) if thumbnail_resource else None

        # Order the gallery with the primary photo first, then the rest as approved.
        ordered_media = media_resources
        if primary_resource:
            ordered_media = [primary_resource] + [r for r in media_resources if r is not primary_resource]
        images = [_resource_url(r.resource_path) for r in ordered_media]

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
                "images": images,
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