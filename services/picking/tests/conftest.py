"""Test fixtures for the Picking service.

Uses an in-memory SQLite engine (see services/packing/tests/conftest.py for
why) and mocks pos_common.http_client.internal_patch so tests don't need a
real Ordering service running — most tests use the `mock_ordering` fixture
(default: succeeds), and the failure-path test overrides it to raise.
"""

from datetime import datetime
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app import create_app
from pos_common.auth import TokenClaims, get_current_user
from pos_common.database import get_session
from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_itempick import PosItemPick
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed
from pos_common.models.pos_staff import PosStaff


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
def fake_user():
    return TokenClaims(id=1, username="picker@example.com", name="Picker", user_role="CLERK")


@pytest.fixture()
def mock_ordering():
    """Default: Ordering's internal endpoints always succeed. Yields the mock
    so a test can inspect call args or override side_effect for failure cases."""
    with patch("app.routes.pickup.internal_patch") as mocked:
        mocked.return_value = {"ordNo": "O000001"}
        yield mocked


@pytest.fixture()
def client(engine, fake_user, mock_ordering):
    app = create_app()

    def _get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = _get_session
    app.dependency_overrides[get_current_user] = lambda: fake_user

    # Not using `with TestClient(app) as client` — see services/packing's conftest
    # for why (avoids running lifespan's init_db() against the real MySQL engine).
    test_client = TestClient(app)
    yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def pending_order(session):
    order = PosOrdHed(
        OrdNo="O000001",
        type="ONL",
        status=OrderStatus.PENDING,
        created_at=datetime.utcnow(),
        member="CUS000001",
        ordaddress="123 Main St",
        cancel=False,
    )
    session.add(order)
    session.add(PosOrdDtl(OrdNo="O000001", lineno=1, itemcode="ITEM001", qty=2, sprice=10, cancel=False))
    session.add(PosItemLots(itemlots_code="ITEM001", itemlots_loc="STORE01", itemlots_desc="Widget", itemlots_uom="EA"))
    session.add(PosStaff(id=1, name="Priya Picker", status=True))
    session.commit()
    return order


@pytest.fixture()
def printed_order(session, pending_order):
    # A real print always moves the order out of "pending" in the same
    # operation that creates the pick row (see print_pickup_order) — mirror
    # that here so this fixture matches production's invariant that a pick
    # never coexists with a still-pending order.
    pending_order.status = OrderStatus.PICKING
    session.add(pending_order)
    session.add(
        PosItemPick(
            itempick_ordno="O000001",
            itempick_loc="STORE01",
            itempick_mddate=datetime.utcnow(),
            itempick_user="1",
            itempick_confirm=False,
        )
    )
    session.commit()
    return pending_order
