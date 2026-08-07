import hashlib
import io
import os
import pathlib
import subprocess
import tempfile
import zipfile
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="HYDROS Malware Scanner")

MAX_ARCHIVE_FILES = int(os.getenv("MAX_ARCHIVE_FILES", "250"))
MAX_ARCHIVE_EXPANDED = int(os.getenv("MAX_ARCHIVE_EXPANDED_BYTES", str(250 * 1024 * 1024)))
BLOCKED = {".exe", ".dll", ".com", ".scr", ".msi", ".bat", ".cmd", ".ps1", ".js", ".jse", ".vbs", ".vbe", ".wsf", ".hta", ".jar", ".apk", ".iso", ".img"}


def archive_check(path: str):
    if not zipfile.is_zipfile(path):
        return {"checked": False, "status": "not_archive"}
    with zipfile.ZipFile(path) as z:
        members = z.infolist()
        if len(members) > MAX_ARCHIVE_FILES:
            return {"checked": True, "clean": False, "reason": "too_many_members"}
        expanded = sum(m.file_size for m in members)
        compressed = sum(max(m.compress_size, 1) for m in members)
        if expanded > MAX_ARCHIVE_EXPANDED:
            return {"checked": True, "clean": False, "reason": "expanded_size_limit"}
        if compressed and expanded / compressed > 100:
            return {"checked": True, "clean": False, "reason": "compression_ratio_limit"}
        for m in members:
            p = pathlib.PurePosixPath(m.filename)
            if p.is_absolute() or ".." in p.parts:
                return {"checked": True, "clean": False, "reason": "path_traversal"}
            if pathlib.Path(m.filename).suffix.lower() in BLOCKED:
                return {"checked": True, "clean": False, "reason": "blocked_member_type"}
    return {"checked": True, "clean": True}


def clamav(path: str):
    p = subprocess.run(["clamscan", "--infected", "--no-summary", path], capture_output=True, text=True, timeout=120)
    if p.returncode == 0:
        return {"clean": True, "detail": "no signature match"}
    if p.returncode == 1:
        return {"clean": False, "detail": (p.stdout or "malware detected").strip()[:1000]}
    return {"clean": False, "error": (p.stderr or "scanner error").strip()[:500]}


def yara_scan(path: str):
    rules = "/app/rules"
    if not os.path.isdir(rules):
        return {"clean": True, "detail": "no custom rules mounted"}
    p = subprocess.run(["yara", "-r", rules, path], capture_output=True, text=True, timeout=60)
    if p.returncode == 0 and p.stdout.strip():
        return {"clean": False, "detail": p.stdout.strip()[:1000]}
    if p.returncode in (0, 1):
        return {"clean": True, "detail": "no rule match"}
    return {"clean": False, "error": "yara scanner error"}


@app.get("/health")
def health():
    return {"status": "ok", "engines": ["clamav", "yara"]}


@app.post("/scan")
async def scan(request: Request):
    name = request.headers.get("x-file-name", "upload.bin")
    expected_hash = request.headers.get("x-sha256", "")
    data = await request.body()
    actual_hash = hashlib.sha256(data).hexdigest()
    if expected_hash and actual_hash != expected_hash:
        return JSONResponse({"clean": False, "reason": "hash_mismatch", "sha256": actual_hash}, status_code=422)

    suffix = pathlib.Path(name).suffix[:12]
    with tempfile.NamedTemporaryFile(prefix="hydros-scan-", suffix=suffix, delete=True) as f:
        f.write(data)
        f.flush()
        arc = archive_check(f.name)
        if arc.get("clean") is False:
            return JSONResponse({"clean": False, "archive": arc, "clamav": {"clean": False, "detail": "not_run"}, "yara": {"clean": False, "detail": "not_run"}, "sha256": actual_hash}, status_code=422)
        cl = clamav(f.name)
        yr = yara_scan(f.name)
        clean = bool(cl.get("clean")) and bool(yr.get("clean"))
        return JSONResponse({"clean": clean, "archive": arc, "clamav": cl, "yara": yr, "sha256": actual_hash}, status_code=200 if clean else 422)
