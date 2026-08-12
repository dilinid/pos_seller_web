from sqlmodel import SQLModel, create_engine, Session

from pos_common.config import settings

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
    """Create tables for whatever models the calling service has imported.

    SQLModel.metadata is a process-global registry populated only by the model
    classes this service actually imported (directly or transitively via
    pos_common.models). A service that never imports PosItemPack, for example,
    never attempts to create/touch that table here — this is what makes each
    service's init_db() naturally respect table ownership without extra code.
    create_all() is idempotent, so this is a no-op against tables that already
    exist (including ones owned by another service, if this one merely reads
    them and thus imported their model class too).
    """
    SQLModel.metadata.create_all(engine)
