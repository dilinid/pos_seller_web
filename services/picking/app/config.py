import os

from pos_common.config import CommonSettings


class Settings(CommonSettings):
    APP_NAME: str = "POS Picking Service"
    # Points at the temporary /internal/orders router on the monolith until
    # Ordering is extracted (Step 4), then repoints at the real Ordering
    # service via this same env var — no code change needed for that switch.
    ORDERING_SERVICE_URL: str = os.getenv("ORDERING_SERVICE_URL", "http://core:8000")


settings = Settings()
