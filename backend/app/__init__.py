import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.routes.auth import router as auth_router
from app.routes.location import router as location_router
from app.routes.marketplace import router as marketplace_router
from app.routes.packing import meta_router as packing_meta_router
from app.routes.packing import router as packing_router
from app.routes.pickup import router as pickup_router
from app.routes.staff import router as staff_router
from app.routes.orders import router as orders_router


logger = logging.getLogger(__name__)

# Resolves to the external POS application's uploads root when UPLOADS_DIR is set;
# otherwise falls back to the local backend/uploads/ dev fixture folder.
UPLOADS_DIR = (
    Path(settings.UPLOADS_DIR)
    if settings.UPLOADS_DIR
    else Path(__file__).resolve().parent.parent / "uploads"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist (idempotent for existing DB)
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        lifespan=lifespan,
    )

    # CORS — allow the frontend dev server
    origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(auth_router)
    app.include_router(location_router)
    app.include_router(marketplace_router)
    app.include_router(orders_router)
    app.include_router(pickup_router)
    app.include_router(packing_router)
    app.include_router(packing_meta_router)
    app.include_router(staff_router)

    # Serve uploaded item resources (images/videos referenced by pos_item_resources.resource_path).
    # UPLOADS_DIR may point at the external POS application's own uploads root (see UPLOADS_DIR
    # in .env) — only auto-create it when using the local dev fallback; never create/alter a
    # directory that's meant to be owned by that other application.
    if not settings.UPLOADS_DIR:
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    elif not UPLOADS_DIR.is_dir():
        logger.warning(
            "UPLOADS_DIR '%s' does not exist or is not reachable — "
            "item resource images/videos will 404 until this is fixed.",
            UPLOADS_DIR,
        )
    app.mount(
        "/uploads",
        StaticFiles(directory=str(UPLOADS_DIR), check_dir=False),
        name="uploads",
    )

    # Health check
    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    return app