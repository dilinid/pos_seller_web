import os

from pos_common.config import CommonSettings


class Settings(CommonSettings):
    APP_NAME: str = "POS Packing Service"
    # Packing calls Ordering's /internal/orders/{ord_no}/status to advance the
    # order to "shipped" when the packing list is printed (see app/routes/packing.py).
    ORDERING_SERVICE_URL: str = os.getenv("ORDERING_SERVICE_URL", "http://core:8000")


settings = Settings()
