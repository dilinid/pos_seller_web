from sqlmodel import select

from pos_common.http_client import InternalCallError
from pos_common.models.pos_itemlots import PosItemLots


def test_list_pickup_orders_includes_pending(client, pending_order):
    resp = client.get("/api/seller/pickup-list")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 1
    assert body[0]["orderNo"] == "O000001"
    assert body[0]["status"] == "Pending"
    assert body[0]["pickNo"] == ""


def test_get_pickup_order_404_when_missing(client):
    resp = client.get("/api/seller/pickup-list/O999999")
    assert resp.status_code == 404


def test_print_first_time_calls_ordering_status_and_creates_pick(client, pending_order, mock_ordering):
    resp = client.post("/api/seller/pickup-list/O000001/print", json={"pickerId": 1})
    assert resp.status_code == 200
    body = resp.json()
    assert body["order"]["pickNo"] == "PK-0001"
    assert body["order"]["picker"] == "Priya Picker"

    mock_ordering.assert_called_once()
    call_args = mock_ordering.call_args
    assert call_args.args[0].endswith("/internal/orders/O000001/status")
    assert call_args.kwargs["json"] == {"status": "picking", "expectedCurrentStatus": "pending"}


def test_reprint_before_confirm_does_not_call_ordering(client, printed_order, mock_ordering):
    resp = client.post("/api/seller/pickup-list/O000001/print", json={"pickerId": 1})
    assert resp.status_code == 200
    mock_ordering.assert_not_called()


def test_remarks_requires_print_first(client, pending_order):
    resp = client.patch("/api/seller/pickup-list/O000001/remarks", json={"remarks": "handle with care"})
    assert resp.status_code == 400


def test_confirm_requires_print_first(client, pending_order):
    resp = client.post("/api/seller/pickup-list/O000001/confirm", json={"items": [{"lineno": 1, "qtyPicked": 2}]})
    assert resp.status_code == 400


def test_confirm_happy_path_calls_ordering_and_commits(client, printed_order, mock_ordering):
    resp = client.post(
        "/api/seller/pickup-list/O000001/confirm",
        json={"items": [{"lineno": 1, "qtyPicked": 2}], "remarks": "all good"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["order"]["status"] == "Confirmed"
    assert body["order"]["remarks"] == "all good"

    # Both the pick-quantities call and the status call must have happened.
    assert mock_ordering.call_count == 2
    urls_called = [call.args[0] for call in mock_ordering.call_args_list]
    assert any(u.endswith("/internal/orders/O000001/pick-quantities") for u in urls_called)
    assert any(u.endswith("/internal/orders/O000001/status") for u in urls_called)

    status_call = next(c for c in mock_ordering.call_args_list if c.args[0].endswith("/status"))
    assert status_call.kwargs["json"] == {"status": "packing", "expectedCurrentStatus": "picking"}


def test_confirm_already_confirmed_fails(client, printed_order, mock_ordering):
    resp1 = client.post("/api/seller/pickup-list/O000001/confirm", json={"items": [{"lineno": 1, "qtyPicked": 2}]})
    assert resp1.status_code == 200

    resp2 = client.post("/api/seller/pickup-list/O000001/confirm", json={"items": [{"lineno": 1, "qtyPicked": 2}]})
    assert resp2.status_code == 400


def test_confirm_moves_reservation_into_pick(client, session, printed_order, mock_ordering):
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    lot.itemlots_reserve = 2  # simulates Ordering's reserve step having already run
    session.add(lot)
    session.commit()

    resp = client.post(
        "/api/seller/pickup-list/O000001/confirm",
        json={"items": [{"lineno": 1, "qtyPicked": 2}]},
    )
    assert resp.status_code == 200

    session.expire_all()
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    assert float(lot.itemlots_pick) == 2
    assert float(lot.itemlots_reserve) == 0


def test_confirm_with_zero_picked_does_not_move_stock(client, session, printed_order, mock_ordering):
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    lot.itemlots_reserve = 2
    session.add(lot)
    session.commit()

    resp = client.post(
        "/api/seller/pickup-list/O000001/confirm",
        json={"items": [{"lineno": 1, "qtyPicked": 0}]},
    )
    assert resp.status_code == 200

    session.expire_all()
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    assert lot.itemlots_pick is None
    assert float(lot.itemlots_reserve) == 2


def test_confirm_returns_502_and_commits_nothing_locally_when_ordering_fails(client, printed_order, mock_ordering):
    """The highest-risk new code path: if Ordering's internal call fails, Picking
    must not commit its local pos_itempick confirm — so a retry of the same
    confirm request is still possible (not blocked by an "already confirmed" 400)."""
    mock_ordering.side_effect = InternalCallError("simulated downstream failure")

    resp = client.post("/api/seller/pickup-list/O000001/confirm", json={"items": [{"lineno": 1, "qtyPicked": 2}]})
    assert resp.status_code == 502

    # Confirm the local pick was NOT marked confirmed — list should still show Pending.
    resp2 = client.get("/api/seller/pickup-list/O000001")
    assert resp2.status_code == 200
    assert resp2.json()["order"]["status"] == "Pending"

    # And a retry (once Ordering is healthy again) must still be accepted, not
    # rejected as "already confirmed".
    mock_ordering.side_effect = None
    mock_ordering.return_value = {"ordNo": "O000001"}
    resp3 = client.post("/api/seller/pickup-list/O000001/confirm", json={"items": [{"lineno": 1, "qtyPicked": 2}]})
    assert resp3.status_code == 200
