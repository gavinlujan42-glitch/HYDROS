FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    clamav clamav-freshclam yara libmagic1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .

# Refresh signatures at image build. Production should also refresh signatures on a schedule.
RUN freshclam || true

ENV PORT=8080
CMD ["sh","-c","freshclam || true; uvicorn app:APP --host 0.0.0.0 --port ${PORT}"]
