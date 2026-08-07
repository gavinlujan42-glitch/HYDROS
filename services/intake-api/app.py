import hashlib
import os
import pathlib
import re
import subprocess
import tempfile
import zipfile
from datetime import datetime, timezone

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import google.auth
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import magic

APP = FastAPI(title="HYDROS Secure Intake API", version="1.0")

ALLOWED_ORIGINS = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "https://gavinlujan42-glitch.github.io").split(",") if x.strip()]
APP.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=False, allow_methods=["POST", "GET"], allow_headers=["Content-Type", "Authorization", "X-Request-ID"])

MAX_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(50 * 1024 * 1024)))
MAX_ARCHIVE_FILES = int(os.getenv("MAX_ARCHIVE_FILES", "250"))
MAX_ARCHIVE_EXPANDED_BYTES = int(os.getenv("MAX_ARCHIVE_EXPANDED_BYTES", str(250 * 1024 * 1024)))

BLOCKED_EXTENSIONS = {".exe", ".dll", ".com", ".scr", ".msi", ".bat", ".cmd", ".ps1", ".js", ".jse", ".vbs", ".vbe", ".wsf", ".hta", ".jar", ".apk", ".iso", ".img"}
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".jpg", ".jpeg", ".png", ".tif", ".tiff", ".zip", ".gpkg"}

DRIVE_FOLDERS = {
    "permits": os.getenv("DRIVE_PERMITS_FOLDER_ID", "14eG6FAQemtshJntPcS0CY_z-KZTnP3s7"),
    "water-rights": os.getenv("DRIVE_WATER_RIGHTS_FOLDER_ID", "142RyFobtq0BLtcYK2NnXWpieX7zPBdTm"),
    "wells": os.getenv("DRIVE_WELLS_FOLDER_ID", "1M-e0JSdUAr-x8V2na2wMMvvwTgem_1oQ"),
}
DEFAULT_CLEAN_FOLDER = os.getenv("DRIVE_CLEAN_FOLDER_ID", "18hgyov-ABu0rXyTFa0tsn4z0SUd1cUSt")
DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file"


def safe_name(name: str) -> str:
    name = pathlib.Path(name or "upload.bin").name
    name = re.sub(r"[^A-Za-z0-9._() -]", "_", name)
    return name[:180]


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def inspect_archive(path: str):
    if not zipfile.is_zipfile(path):
        return
    with zipfile.ZipFile(path) as z:
        members = z.infolist()
        if len(members) > MAX_ARCHIVE_FILES:
            raise HTTPException(422, "Archive contains too many files")
        expanded = sum(m.file_size for m in members)
        compressed = sum(max(m.compress_size, 1) for m in members)
        if expanded > MAX_ARCHIVE_EXPANDED_BYTES:
            raise HTTPException(422, "Archive expands beyond security limit")
        if compressed and expanded / compressed > 100:
            raise HTTPException(422, "Archive compression ratio exceeds security limit")
        for m in members:
            member_path = pathlib.PurePosixPath(m.filename)
            if member_path.is_absolute() or ".." in member_path.parts:
                raise HTTPException(422, "Unsafe archive path detected")
            if pathlib.Path(m.filename).suffix.lower() in BLOCKED_EXTENSIONS:
                raise HTTPException(422, "Archive contains a blocked executable/script type")


def clamav_scan(path: str):
    proc = subprocess.run(["clamscan", "--infected", "--no-summary", path], capture_output=True, text=True, timeout=120)
    if proc.returncode == 1:
        return {"clean": False, "engine": "ClamAV", "detail": proc.stdout.strip() or "malware detected"}
    if proc.returncode > 1:
        raise HTTPException(503, f"ClamAV scanner error: {proc.stderr.strip()[:300]}")
    return {"clean": True, "engine": "ClamAV", "detail": "no signature match"}


def yara_scan(path: str):
    rules = os.getenv("YARA_RULES", "/app/rules")
    if not os.path.isdir(rules):
        return {"clean": True, "engine": "YARA", "detail": "no custom rules mounted"}
    proc = subprocess.run(["yara", "-r", rules, path], capture_output=True, text=True, timeout=60)
    if proc.returncode == 0 and proc.stdout.strip():
        return {"clean": False, "engine": "YARA", "detail": proc.stdout.strip()[:1000]}
    if proc.returncode not in (0, 1):
        raise HTTPException(503, "YARA scanner error")
    return {"clean": True, "engine": "YARA", "detail": "no rule match"}


def drive_client():
    key_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if key_path:
        creds = service_account.Credentials.from_service_account_file(key_path, scopes=[DRIVE_SCOPE])
    else:
        # Preferred on Cloud Run / GKE / other workload-identity platforms.
        creds, _ = google.auth.default(scopes=[DRIVE_SCOPE])
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def upload_clean_file(path: str, name: str, mime: str, category: str, sha256: str):
    folder = DRIVE_FOLDERS.get(category, DEFAULT_CLEAN_FOLDER)
    drive = drive_client()
    media = MediaFileUpload(path, mimetype=mime or "application/octet-stream", resumable=True)
    body = {"name": name, "parents": [folder], "description": f"HYDROS clean intake; sha256={sha256}; scanned={datetime.now(timezone.utc).isoformat()}"}
    return drive.files().create(body=body, media_body=media, fields="id,name,webViewLink,parents").execute()


@APP.get("/health")
def health():
    return {"status": "ok", "service": "hydros-secure-intake", "clamav": True, "yara": True}


@APP.post("/v1/upload")
async def upload(file: UploadFile = File(...), category: str = Form("permits"), tracking_id: str = Form("")):
    name = safe_name(file.filename)
    ext = pathlib.Path(name).suffix.lower()
    if ext in BLOCKED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(415, "File type is not accepted")

    with tempfile.TemporaryDirectory(prefix="hydros-quarantine-") as td:
        path = os.path.join(td, name)
        size = 0
        with open(path, "wb") as out:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_BYTES:
                    raise HTTPException(413, "File exceeds upload size limit")
                out.write(chunk)

        mime = magic.from_file(path, mime=True)
        digest = sha256_file(path)
        inspect_archive(path)

        cl = clamav_scan(path)
        yr = yara_scan(path)
        scan = {"clamav": cl, "yara": yr, "mime": mime, "sha256": digest, "size": size}
        if not cl["clean"] or not yr["clean"]:
            # Malicious bytes are NOT promoted to Drive. Temporary quarantine is destroyed on exit.
            raise HTTPException(422, detail={"status": "rejected", "reason": "malware_or_policy_match", "scan": scan})

        drive_file = upload_clean_file(path, name, mime, category, digest)
        return {
            "status": "clean_and_stored",
            "tracking_id": tracking_id,
            "file": {"name": name, "size": size, "mime": mime, "sha256": digest},
            "scan": {"clamav": cl, "yara": yr, "archive_policy": "passed"},
            "drive": drive_file,
        }
