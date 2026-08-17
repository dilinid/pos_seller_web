from unittest.mock import patch

from sqlmodel import select

from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed
from pos_common.models.pos_setup import PosSetup


def _deliver(session, ord_no):
    """Test-only shortcut for what Picking/Packing would normally do via
    Ordering's internal API — flips an order straight to DELIVERED so return
    eligibility (which requires it) can be exercised."""
    order = session.get(PosOrdHed, ord_no)
    order.status = OrderStatus.DELIVERED
    session.add(order)
    session.commit()


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


def _return_body(quantity=1, reason="defective", note=None):
    return {"items": [{"itemCode": "ITEM001", "quantity": quantity}], "reason": reason, "note": note}


def test_return_before_delivered_fails(client):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    resp = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body())
    assert resp.status_code == 400


def test_return_non_returnable_item_fails(client, session):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)

    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    lot.is_returnable = False
    session.add(lot)
    session.commit()

    resp = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body())
    assert resp.status_code == 400


def test_return_over_ordered_quantity_fails(client, session):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)

    resp = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=99))
    assert resp.status_code == 400


def test_return_success_creates_rtn_order_and_does_not_restock(client, session):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)

    resp = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=2, reason="wrong_size", note="Too small"))
    assert resp.status_code == 201
    body = resp.json()
    assert body["id"].startswith("R")
    assert body["isReturn"] is True
    assert body["originalOrderId"] == ord_no
    assert body["items"][0]["returnReason"] == "wrong_size"
    assert body["items"][0]["returnReasonNote"] == "Too small"

    session.expire_all()
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    assert not lot.itemlots_sih  # restocking only happens on refund, not on filing


def test_return_exhausted_quantity_fails_on_second_request(client, session):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)

    first = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=2))
    assert first.status_code == 201

    second = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=1))
    assert second.status_code == 400


def test_return_window_expired_fails(client, session):
    from datetime import datetime, timedelta

    session.add(PosSetup(id="setup1", setup_rtndays=7))
    session.commit()

    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)

    order = session.get(PosOrdHed, ord_no)
    order.created_at = datetime.utcnow() - timedelta(days=30)
    session.add(order)
    session.commit()

    resp = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body())
    assert resp.status_code == 400


def test_list_my_returns_and_seller_returns(client, session):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)
    client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=1))

    mine = client.get("/api/marketplace/orders/returns")
    assert mine.status_code == 200
    assert len(mine.json()) == 1

    seller = client.get("/api/marketplace/seller/orders/returns")
    assert seller.status_code == 200
    assert len(seller.json()) == 1


def test_refund_marks_refunded_and_restocks(client, session):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)
    rtn_ord_no = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=2)).json()["id"]

    resp = client.post(f"/api/marketplace/seller/orders/returns/{rtn_ord_no}/refund")
    assert resp.status_code == 200
    assert resp.json()["items"][0]["status"] == "refunded"

    session.expire_all()
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    assert float(lot.itemlots_sih) == 2.0


def test_refund_twice_fails(client, session):
    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)
    rtn_ord_no = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=1)).json()["id"]

    client.post(f"/api/marketplace/seller/orders/returns/{rtn_ord_no}/refund")
    resp = client.post(f"/api/marketplace/seller/orders/returns/{rtn_ord_no}/refund")
    assert resp.status_code == 409


def test_refund_defaults_to_card_and_creates_invoice(client, session):
    from pos_common.models.pos_invdtl import PosInvDtl
    from pos_common.models.pos_invhed import PosInvHed
    from pos_common.models.pos_invpay import PosInvPay

    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)
    rtn_ord_no = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=2)).json()["id"]

    resp = client.post(f"/api/marketplace/seller/orders/returns/{rtn_ord_no}/refund")
    assert resp.status_code == 200

    session.expire_all()
    order = session.get(PosOrdHed, rtn_ord_no)
    assert order.is_invoiced is True
    assert order.InvNo

    inv = session.get(PosInvHed, order.InvNo)
    assert inv.pricemode == "CARD"
    assert inv.refno == rtn_ord_no
    assert inv.netamount < 0
    assert inv.payamount == inv.netamount
    assert inv.dueamount == 0

    dtl = session.exec(select(PosInvDtl).where(PosInvDtl.InvNo == order.InvNo)).all()
    assert len(dtl) == 1
    assert dtl[0].qty == 2
    assert dtl[0].amount < 0

    pay = session.exec(select(PosInvPay).where(PosInvPay.Invno == order.InvNo)).first()
    assert pay.paytype == "CRD"
    assert pay.amount == inv.netamount


def test_refund_with_cash_method_uses_cash_paymode(client, session):
    from pos_common.models.pos_invpay import PosInvPay

    ord_no = _place(client, payment_method="cod").json()["ordNo"]
    _deliver(session, ord_no)
    rtn_ord_no = client.post(f"/api/marketplace/orders/{ord_no}/return", json=_return_body(quantity=1)).json()["id"]

    resp = client.post(f"/api/marketplace/seller/orders/returns/{rtn_ord_no}/refund", json={"method": "cash"})
    assert resp.status_code == 200

    session.expire_all()
    order = session.get(PosOrdHed, rtn_ord_no)
    pay = session.exec(select(PosInvPay).where(PosInvPay.Invno == order.InvNo)).first()
    assert pay.paytype == "CSH"
