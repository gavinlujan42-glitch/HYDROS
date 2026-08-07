#!/usr/bin/env bash
set -euo pipefail
API="${1:-${HYDROS_UPLOAD_API:-}}"
[ -n "$API" ] || { echo "Usage: $0 https://service-url" >&2; exit 2; }
API="${API%/}"

echo "[1/3] Health"
curl --fail --silent --show-error "$API/health" | tee /tmp/hydros-health.json

echo
echo "[2/3] Blocked executable policy"
printf 'MZ-not-a-real-executable' >/tmp/hydros-test.exe
code=$(curl --silent --output /tmp/hydros-blocked.json --write-out '%{http_code}' \
  -F 'file=@/tmp/hydros-test.exe;type=application/octet-stream' \
  -F 'category=permits' "$API/v1/upload")
if [ "$code" != "415" ]; then
  echo "FAIL: expected HTTP 415, got $code" >&2
  cat /tmp/hydros-blocked.json >&2
  exit 1
fi

echo "Blocked executable correctly rejected."

echo "[3/3] EICAR malware test"
printf '%s' 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' >/tmp/eicar.txt
code=$(curl --silent --output /tmp/hydros-eicar.json --write-out '%{http_code}' \
  -F 'file=@/tmp/eicar.txt;type=text/plain' \
  -F 'category=permits' "$API/v1/upload")
if [ "$code" != "422" ]; then
  echo "FAIL: expected malware rejection HTTP 422, got $code" >&2
  cat /tmp/hydros-eicar.json >&2
  exit 1
fi

echo "EICAR correctly rejected and must not be promoted to Drive."
echo "HYDROS secure intake smoke tests passed."
