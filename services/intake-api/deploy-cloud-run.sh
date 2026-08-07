#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:?Set PROJECT_ID}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-hydros-secure-intake}"
RUNTIME_SA="${RUNTIME_SA:-hydros-intake@${PROJECT_ID}.iam.gserviceaccount.com}"
ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-https://gavinlujan42-glitch.github.io}"

# Drive folder IDs are not secrets. They identify the controlled destination folders.
DRIVE_CLEAN_FOLDER_ID="${DRIVE_CLEAN_FOLDER_ID:-18hgyov-ABu0rXyTFa0tsn4z0SUd1cUSt}"
DRIVE_PERMITS_FOLDER_ID="${DRIVE_PERMITS_FOLDER_ID:-14eG6FAQemtshJntPcS0CY_z-KZTnP3s7}"
DRIVE_WATER_RIGHTS_FOLDER_ID="${DRIVE_WATER_RIGHTS_FOLDER_ID:-142RyFobtq0BLtcYK2NnXWpieX7zPBdTm}"
DRIVE_WELLS_FOLDER_ID="${DRIVE_WELLS_FOLDER_ID:-1M-e0JSdUAr-x8V2na2wMMvvwTgem_1oQ}"

command -v gcloud >/dev/null || { echo "gcloud CLI is required" >&2; exit 1; }

gcloud config set project "$PROJECT_ID" >/dev/null

gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com drive.googleapis.com

if ! gcloud iam service-accounts describe "$RUNTIME_SA" >/dev/null 2>&1; then
  gcloud iam service-accounts create hydros-intake --display-name="HYDROS Secure Intake Runtime"
fi

# Deploy directly from this source directory. Cloud Build creates the container.
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --service-account "$RUNTIME_SA" \
  --allow-unauthenticated \
  --cpu=2 \
  --memory=2Gi \
  --concurrency=4 \
  --timeout=180 \
  --max-instances=10 \
  --set-env-vars="ALLOWED_ORIGINS=${ALLOWED_ORIGINS},DRIVE_CLEAN_FOLDER_ID=${DRIVE_CLEAN_FOLDER_ID},DRIVE_PERMITS_FOLDER_ID=${DRIVE_PERMITS_FOLDER_ID},DRIVE_WATER_RIGHTS_FOLDER_ID=${DRIVE_WATER_RIGHTS_FOLDER_ID},DRIVE_WELLS_FOLDER_ID=${DRIVE_WELLS_FOLDER_ID},MAX_UPLOAD_BYTES=52428800,MAX_ARCHIVE_FILES=250,MAX_ARCHIVE_EXPANDED_BYTES=262144000"

URL="$(gcloud run services describe "$SERVICE" --region "$REGION" --format='value(status.url)')"
echo "HYDROS Secure Intake deployed: $URL"
echo "Health check: $URL/health"
echo
printf '%s\n' "IMPORTANT: Share only the approved Google Drive destination folders with:" "$RUNTIME_SA" "as Writer. Do not grant broad My Drive access."
