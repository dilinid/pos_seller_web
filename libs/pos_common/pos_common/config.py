"""Shared settings surface for all pos_seller_web services.

Every service reads the env vars relevant to it; unused fields (e.g. Packing
never reads INTERNAL_SERVICE_TOKEN) are simply left at their defaults in that
service's .env. Each service may subclass this and add service-specific
fields, but DB/JWT/CORS fields stay centralized here so they're defined once.
"""

import os

from dotenv import load_dotenv

load_dotenv()


class CommonSettings:
    APP_NAME: str = os.getenv("APP_NAME", "POS Seller Web Service")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"

    # Database — one shared MySQL instance across all services (see libs/pos_common/README.md
    # for why: the pos_* tables are owned by an external legacy POS application).
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "posdb_2")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    # Smaller default than the old monolith's (5) since multiple services now each
    # hold their own pool against the same externally-shared MySQL instance.
    DATABASE_POOL_SIZE: int = int(os.getenv("DATABASE_POOL_SIZE", "3"))
    DATABASE_MAX_OVERFLOW: int = int(os.getenv("DATABASE_MAX_OVERFLOW", "5"))
    DATABASE_ECHO: bool = os.getenv("DATABASE_ECHO", "false").lower() == "true"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # JWT — SECRET_KEY must be identical across every service so tokens issued by
    # Core are verifiable locally (no network call) by Ordering/Picking/Packing.
    SECRET_KEY: str = os.getenv("SECRET_KEY", "change-me")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30")
    )
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = int(
        os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS", "7")
    )

    # Service-to-service auth for /internal/* endpoints (e.g. Picking -> Ordering).
    # Same value must be set on both the caller and the callee.
    INTERNAL_SERVICE_TOKEN: str = os.getenv("INTERNAL_SERVICE_TOKEN", "change-me-internal")

    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")


settings = CommonSettings()
