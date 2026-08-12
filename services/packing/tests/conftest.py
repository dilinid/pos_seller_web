"""Test fixtures for the Packing service.

Uses an in-memory SQLite engine instead of the real shared MySQL instance —
this is a smoke/integration suite meant to run fast and portably in CI/dev
without provisioning a MySQL schema; it exercises the same SQLModel code paths
Packing runs in production. SQLite doesn't enforce the DECIMAL/Enum column
types as strictly as MySQL, but the business logic under test (status
transitions, 400/404 branches) is unaffected by that difference.

Also mocks pos_common.http_client.internal_patch (see Picking's conftest.py
for the same pattern) so tests don't need a real Ordering service running.
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
from pos_common.models.pos_itempack import PosItemPack
from pos_common.models.pos_itempick import PosItemPick
from pos_common.models.pos_orddtl import PosOrdDtl
from pos_common.models.pos_ordhed import OrderStatus, PosOrdHed
from pos_common.models.pos_package_type import PosPackageType
from pos_common.models.pos_staff import PosStaff


@pytest.fixture()
def engine():
    # StaticPool is required for in-memory SQLite here: FastAPI's TestClient runs
    # sync route handlers in a worker thread, so without a single shared
    # connection across threads each request would see a fresh, empty database.
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
    return TokenClaims(id=1, username="packer@example.com", name="Packer", user_role="CLERK")


@pytest.fixture()
def mock_ordering():
    """Default: Ordering's internal endpoints always succeed. Yields the mock
    so a test can inspect call args or override side_effect for failure cases."""
    with patch("app.routes.packing.internal_patch") as mocked:
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

    # Deliberately NOT using `with TestClient(app) as client` — that would run
    # the app's lifespan (init_db()) against pos_common's real MySQL engine,
    # not this fixture's SQLite one. Tables are already created above via
    # SQLModel.metadata.create_all(engine), so skipping lifespan is safe.
    test_client = TestClient(app)
    yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def unpicked_order(session):
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
    session.commit()
    return order


@pytest.fixture()
def picked_order(session, unpicked_order):
    # Confirming a pick advances the order to "packing" in the real flow (Picking
    # calls Ordering's /internal/orders/* API) — mirror that here so ship's
    # expectedCurrentStatus=PACKING compare-and-swap reflects a realistic state.
    unpicked_order.status = OrderStatus.PACKING
    session.add(unpicked_order)
    session.add(
        PosItemPick(
            itempick_ordno="O000001",
            itempick_loc="STORE01",
            itempick_mddate=datetime.utcnow(),
            itempick_user="1",
            itempick_confirm=True,
        )
    )
    session.add(PosItemLots(itemlots_code="ITEM001", itemlots_loc="STORE01", itemlots_desc="Widget", itemlots_uom="EA"))
    session.add(PosPackageType(id=1, type="Box S", length=10, width=10, height=10, status=True))
    session.add(PosStaff(id=1, name="Alice Packer", status=True))
    session.commit()
    return unpicked_order
