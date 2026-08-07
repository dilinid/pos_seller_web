from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app import create_app
from pos_common.config import settings
from pos_common.database import get_session
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed


@pytest.fixture()
def engine():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture()
def session(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture()
def order(session):
    order = PosOrdHed(OrdNo="O000001", type="ONL", status=OrderStatus.PICKING, created_at=datetime.utcnow(), cancel=False)
    session.add(order)
    session.add(PosOrdDtl(OrdNo="O000001", lineno=1, itemcode="ITEM001", qty=2, sprice=10, cancel=False))
    session.commit()
    return order


@pytest.fixture()
def client(engine):
    app = create_app()

    def _get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = _get_session

    test_client = TestClient(app)
    yield test_client

    app.dependency_overrides.clear()


AUTH = {"Authorization": f"Bearer {settings.INTERNAL_SERVICE_TOKEN}"}


def test_missing_token_rejected(client, order):
    resp = client.patch(
        "/internal/orders/O000001/status",
        json={"status": "packing", "expectedCurrentStatus": "picking"},
    )
    assert resp.status_code == 401


def test_wrong_token_rejected(client, order):
    resp = client.patch(
        "/internal/orders/O000001/status",
        json={"status": "packing", "expectedCurrentStatus": "picking"},
        headers={"Authorization": "Bearer wrong-token"},
    )
    assert resp.status_code == 401


def test_status_update_success(client, order):
    resp = client.patch(
        "/internal/orders/O000001/status",
        json={"status": "packing", "expectedCurrentStatus": "picking"},
        headers=AUTH,
    )
    assert resp.status_code == 200
    assert resp.json() == {"ordNo": "O000001", "status": "packing"}


def test_status_update_compare_and_swap_rejects_stale_transition(client, order):
    resp = client.patch(
        "/internal/orders/O000001/status",
        json={"status": "packing", "expectedCurrentStatus": "pending"},  # order is actually "picking"
        headers=AUTH,
    )
    assert resp.status_code == 409


def test_status_update_404_for_unknown_order(client):
    resp = client.patch(
        "/internal/orders/O999999/status",
        json={"status": "packing", "expectedCurrentStatus": "picking"},
        headers=AUTH,
    )
    assert resp.status_code == 404


def test_status_update_retry_after_success_is_rejected_not_reapplied(client, order):
    """Demonstrates the accepted residual-risk behavior documented in the plan:
    a retried call with the ORIGINAL expectedCurrentStatus is correctly rejected
    once the first call already applied the transition — it is not silently
    reapplied, and it is not treated as a successful no-op either."""
    first = client.patch(
        "/internal/orders/O000001/status",
        json={"status": "packing", "expectedCurrentStatus": "picking"},
        headers=AUTH,
    )
    assert first.status_code == 200

    retry = client.patch(
        "/internal/orders/O000001/status",
        json={"status": "packing", "expectedCurrentStatus": "picking"},
        headers=AUTH,
    )
    assert retry.status_code == 409


def test_pick_quantities_update_success(client, order):
    resp = client.patch(
        "/internal/orders/O000001/pick-quantities",
        json={"items": [{"lineno": 1, "qtyPicked": 2}]},
        headers=AUTH,
    )
    assert resp.status_code == 200
    assert resp.json() == {"ordNo": "O000001", "updated": 1}


def test_pick_quantities_unknown_lineno_ignored(client, order):
    resp = client.patch(
        "/internal/orders/O000001/pick-quantities",
        json={"items": [{"lineno": 99, "qtyPicked": 2}]},
        headers=AUTH,
    )
    assert resp.status_code == 200
