FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080

RUN apt-get update && apt-get install -y --no-install-recommends \
    clamav clamav-freshclam yara ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY rules ./rules

# Build with current signatures; refresh again on container start.
RUN freshclam || true

CMD ["sh", "-c", "freshclam || true; exec uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
