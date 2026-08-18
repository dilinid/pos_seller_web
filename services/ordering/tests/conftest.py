"""Test fixtures for the Ordering service (see services/packing/tests/conftest.py
for why an in-memory SQLite StaticPool engine is used and why the TestClient
fixture deliberately skips triggering the app's lifespan)."""

from datetime import datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app import create_app
from pos_common.auth import TokenClaims, get_current_user
from pos_common.database import get_session
from pos_common.models.pos_customer import PosCustomer
from pos_common.models.pos_itemlots import PosItemLots
from pos_common.models.pos_loc import PosLoc
from pos_common.models.pos_paymode import PosPayMode


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
def customer(session):
    cust = PosCustomer(cus_id=1, cus_code="CUS000001", cus_name="Jane Buyer", cus_active=True)
    session.add(cust)
    session.add(PosItemLots(itemlots_code="ITEM001", itemlots_loc="STORE01", itemlots_desc="Widget", itemlots_uom="EA", itemlots_active=True))
    session.add(PosPayMode(pay_code="CRD", pay_typedesc="Card"))
    session.add(PosPayMode(pay_code="CSH", pay_typedesc="Cash"))
    session.add(PosLoc(loc_code="STORE01", loc_desc="Marketplace", loc_address="No.123, Main Road", loc_active=True))
    session.add(PosLoc(loc_code="STORE02", loc_desc="Kollupitiya", loc_address="No.45, Galle Road", loc_active=True))
    session.commit()
    return cust


@pytest.fixture()
def fake_user(customer):
    return TokenClaims(id=1, username="buyer@example.com", name="Jane Buyer", user_role="CLERK", customer_id=customer.cus_id)


@pytest.fixture()
def client(engine, fake_user):
    app = create_app()

    def _get_session():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_session] = _get_session
    app.dependency_overrides[get_current_user] = lambda: fake_user

    test_client = TestClient(app)
    yield test_client

    app.dependency_overrides.clear()
