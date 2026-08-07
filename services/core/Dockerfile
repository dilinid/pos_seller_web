# Dockerfile for the residual monolith ("Core" — orders/picking/packing have
# all been extracted; this now serves only auth/location/marketplace/staff).
# Core doesn't depend on libs/pos_common (it has its own self-contained
# app/database.py, app/models/*, etc.), but the build context is still the
# repo root for consistency with the other services' Dockerfiles.
FROM python:3.12-slim

WORKDIR /app

COPY services/core/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY services/core/app /app/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
