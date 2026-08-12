# Build context must be the repo root (docker-compose.yml sets this) so this
# Dockerfile can COPY libs/pos_common in.
FROM python:3.12-slim

WORKDIR /app

COPY services/picking/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY libs/pos_common /libs/pos_common
RUN pip install --no-cache-dir -e /libs/pos_common

COPY services/picking/app /app/app
COPY services/picking/main.py /app/main.py

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
