from sqlmodel import select

from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_orddtl import PosOrdDtl


def test_list_packing_orders_empty(client):
    resp = client.get("/api/seller/packing-list")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_packing_order_404_when_not_picked(client, unpicked_order):
    resp = client.get("/api/seller/packing-list/O000001")
    assert resp.status_code == 404


def test_get_packing_order_200_when_picked(client, picked_order):
    resp = client.get("/api/seller/packing-list/O000001")
    assert resp.status_code == 200
    body = resp.json()
    assert body["order"]["orderNo"] == "O000001"
    assert body["order"]["status"] == "Pending"
    assert len(body["items"]) == 1
    assert body["items"][0]["itemCode"] == "ITEM001"


def test_list_package_types(client, picked_order):
    resp = client.get("/api/seller/package-types")
    assert resp.status_code == 200
    assert resp.json() == [
        {"id": 1, "type": "Box S", "length": 10.0, "width": 10.0, "height": 10.0}
    ]


def test_mark_packed_requires_confirmed_pick(client, unpicked_order):
    resp = client.post(
        "/api/seller/packing-list/O000001/pack",
        json={"packageTypeId": 1, "packerId": 1, "weight": 1.5},
    )
    assert resp.status_code == 400


def test_mark_packed_then_double_pack_fails(client, picked_order):
    resp = client.post(
        "/api/seller/packing-list/O000001/pack",
        json={"packageTypeId": 1, "packerId": 1, "weight": 1.5, "remarks": "handle with care"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["order"]["status"] == "Packed & Ready"
    assert body["order"]["packNo"] == "PL-0001"
    assert body["order"]["packedBy"] == "Alice Packer"

    resp2 = client.post(
        "/api/seller/packing-list/O000001/pack",
        json={"packageTypeId": 1, "packerId": 1, "weight": 1.5},
    )
    assert resp2.status_code == 400


def test_update_remarks_requires_existing_pack(client, picked_order):
    resp = client.patch("/api/seller/packing-list/O000001/remarks", json={"remarks": "fragile"})
    assert resp.status_code == 400

    client.post(
        "/api/seller/packing-list/O000001/pack",
        json={"packageTypeId": 1, "packerId": 1, "weight": 1.5},
    )
    resp2 = client.patch("/api/seller/packing-list/O000001/remarks", json={"remarks": "fragile"})
    assert resp2.status_code == 200
    assert resp2.json()["remarks"] == "fragile"


def test_mark_packed_reduces_stock_on_hand(client, session, picked_order):
    # Simulate Picking's confirm having already run: this line was picked, and
    # that moved 2 units into itemlots_pick on the lot.
    line = session.exec(select(PosOrdDtl).where(PosOrdDtl.OrdNo == "O000001")).first()
    line.pickqty = 2
    session.add(line)
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    lot.itemlots_sih = 50
    lot.itemlots_pick = 2
    session.add(lot)
    session.commit()

    resp = client.post(
        "/api/seller/packing-list/O000001/pack",
        json={"packageTypeId": 1, "packerId": 1, "weight": 1.5},
    )
    assert resp.status_code == 200

    session.expire_all()
    lot = session.exec(select(PosItemLots).where(PosItemLots.itemlots_code == "ITEM001")).first()
    assert float(lot.itemlots_sih) == 48
    assert float(lot.itemlots_pick) == 0


def test_ship_flow_and_double_ship_fails(client, picked_order, mock_ordering):
    resp = client.post("/api/seller/packing-list/O000001/ship")
    assert resp.status_code == 400  # not packed yet

    client.post(
        "/api/seller/packing-list/O000001/pack",
        json={"packageTypeId": 1, "packerId": 1, "weight": 1.5},
    )
    resp2 = client.post("/api/seller/packing-list/O000001/ship")
    assert resp2.status_code == 200
    assert resp2.json()["order"]["status"] == "Shipped"
    mock_ordering.assert_called_once()
    call_url, call_kwargs = mock_ordering.call_args
    assert call_url[0].endswith("/internal/orders/O000001/status")
    assert call_kwargs["json"] == {"status": "shipped", "expectedCurrentStatus": "packing"}

    resp3 = client.post("/api/seller/packing-list/O000001/ship")
    assert resp3.status_code == 400


def test_list_packing_orders_reflects_confirmed_picks(client, picked_order):
    resp = client.get("/api/seller/packing-list")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 1
    assert body[0]["orderNo"] == "O000001"
