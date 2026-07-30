from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
)


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    """Create all tables that are defined as SQLModel models.
    For an existing database this is a no-op unless new models are added."""
    SQLModel.metadata.create_all(engine)