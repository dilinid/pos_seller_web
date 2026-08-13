from unittest.mock import patch

from sqlmodel import select

from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_orddtl import PosOrdDtl


def _place(client, payment_method="cod", delivery_method="pickup", address=None, location_code="STORE01"):
    body = {
        "items": [{"itemCode": "ITEM001", "quantity": 2, "price": 10.5}],
        "deliveryMethod": delivery_method,
        "deliveryAddress": address,
        "deliveryFee": 5,
        "paymentMethod": payment_method,
        "locationCode": location_code,
    }
    return client.post("/api/marketplace/orders", json=body)


def test_place_order_cod_creates_order_no_invoice(client):
    resp = _place(client, payment_method="cod")
    assert resp.status_code == 201
    body = resp.json()
    assert body["ordNo"].startswith("O")
    assert len(body["ordNo"]) == 7
    assert body["status"] == "pending"


def test_place_order_card_creates_order_and_invoice(client):
    resp = _place(client, payment_method="card")
    assert resp.status_code == 201
    body = resp.json()
    assert body["ordNo"].startswith("O")

    # Verify it's marked paid (card captured immediately at checkout).
    my_orders = client.get("/api/marketplace/orders").json()
    order = next(o for o in my_orders if o["id"] == body["ordNo"])
    assert order["paymentStatus"] == "paid"
    assert order["paymentMethod"] == "card"


def test_place_order_sequential_ord_no_increments(client):
    resp1 = _place(client, payment_method="cod")
    resp2 = _place(client, payment_method="cod")
    ord1 = resp1.json()["ordNo"]
    ord2 = resp2.json()["ordNo"]
    assert int(ord2[1:]) == int(ord1[1:]) + 1


def test_place_order_empty_items_fails(client):
    resp = client.post(
        "/api/marketplace/orders",
        json={"items": [], "deliveryMethod": "pickup", "deliveryFee": 0, "paymentMethod": "cod", "locationCode": "STORE01"},
    )
    assert resp.status_code == 400


def test_place_order_unknown_item_fails(client):
    resp = client.post(
        "/api/marketplace/orders",
        json={
            "items": [{"itemCode": "NOPE", "quantity": 1, "price": 5}],
            "deliveryMethod": "pickup",
            "deliveryFee": 0,
            "paymentMethod": "cod",
            "locationCode": "STORE01",
        },
    )
    assert resp.status_code == 400


def test_place_order_delivery_without_address_fails(client):
    resp = _place(client, payment_method="cod", delivery_method="delivery", address=None)
    assert resp.status_code == 400


def test_place_order_delivery_with_address_succeeds(client):
    resp = _place(client, payment_method="cod", delivery_method="delivery", address="123 Main St")
    assert resp.status_code == 201


def test_list_my_orders_returns_only_own_orders(client):
    _place(client, payment_method="cod")
    resp = client.get("/api/marketplace/orders")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_get_my_order_404_for_unknown(client):
    resp = client.get("/api/marketplace/orders/O999999")
    assert resp.status_code == 404


def test_get_my_order_returns_placed_order(client):
    placed = _place(client, payment_method="cod").json()
    resp = client.get(f"/api/marketplace/orders/{placed['ordNo']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == placed["ordNo"]


def test_list_seller_orders_includes_all_customers(client):
    _place(client, payment_method="cod")
    resp = client.get("/api/marketplace/seller/orders")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_place_order_reserves_stock(client, session):
    resp = _place(client, payment_method="cod")
    assert resp.status_code == 201

    session.expire_all()
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    assert float(lot.itemlots_reserve) == 2  # matches the 2-unit order in _place()


def test_place_order_reserves_stock_cumulatively_across_orders(client, session):
    _place(client, payment_method="cod")
    _place(client, payment_method="cod")

    session.expire_all()
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    assert float(lot.itemlots_reserve) == 4


def test_place_order_retries_when_collision_surfaces_at_intermediate_autoflush(client, session):
    """Regression test: a duplicate-ord_no collision that only surfaces at a later
    autoflush point — adjust_itemlots_stock's SELECT ... FOR UPDATE, or
    _generate_inv_no's SELECT for card payments — rather than at the header's own
    insert or the final commit, must still be caught and retried with a fresh
    order number, not propagate as an unhandled 500."""
    # An orphaned pos_orddtl row for "O000001" (as if another transaction had
    # already gotten that far) only collides once this attempt tries to insert its
    # own line 1 for the same OrdNo — not at header-insert time, so the header's
    # own flush wouldn't have caught this on its own.
    session.add(PosOrdDtl(OrdNo="O000001", lineno=1, itemcode="ITEM001", qty=1, sprice=1, cancel=False))
    session.commit()

    with patch("app.routes.orders._generate_ord_no", side_effect=["O000001", "O000002"]):
        resp = _place(client, payment_method="card")

    assert resp.status_code == 201
    assert resp.json()["ordNo"] == "O000002"
