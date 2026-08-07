# HYDROS Secure Intake API

Secure file intake service for HYDROS. GitHub Pages must never upload directly to Google Drive or expose Drive credentials.

## Security pipeline

1. Browser sends multipart upload over HTTPS to this service.
2. Service writes only to an ephemeral quarantine directory.
3. Filename and extension allowlist validation.
4. libmagic MIME detection.
5. Archive bomb/path traversal/executable checks for ZIP payloads.
6. SHA-256 content hash.
7. ClamAV malware signature scan.
8. YARA policy/custom threat-rule scan.
9. Only files passing every gate are promoted to the approved Google Drive folder.
10. Rejected payload bytes are destroyed with the ephemeral quarantine directory. Do not preserve known-malicious binaries in Drive.

No malware scanner provides a 100% guarantee. Production defense should also include timely signature/rule updates, platform logging, upload rate limits, WAF protections, identity/authentication where required, sandbox/CDR for higher-risk document classes, alerting, and periodic independent security testing.

## Drive folders

Root `HYDROS Secure Intake`: `1O2JCsK5ArzLULOPoAC78DonwD6VTOnCv`

Clean approved: `18hgyov-ABu0rXyTFa0tsn4z0SUd1cUSt`

- Permits: `14eG6FAQemtshJntPcS0CY_z-KZTnP3s7`
- Water Rights: `142RyFobtq0BLtcYK2NnXWpieX7zPBdTm`
- Wells: `1M-e0JSdUAr-x8V2na2wMMvvwTgem_1oQ`

## Required secrets / configuration

Never commit service-account JSON or OAuth secrets.

- `GOOGLE_APPLICATION_CREDENTIALS`: mounted secret path for a service account or workload identity credential.
- `ALLOWED_ORIGINS`: GitHub Pages production origin.
- `DRIVE_CLEAN_FOLDER_ID`, `DRIVE_PERMITS_FOLDER_ID`, `DRIVE_WATER_RIGHTS_FOLDER_ID`, `DRIVE_WELLS_FOLDER_ID`.
- `MAX_UPLOAD_BYTES`.
- `YARA_RULES`: optional mounted directory of approved YARA rules.

The target Drive folders must be shared with the service identity using the minimum required write permission.

## Recommended deployment

Use a container platform that can execute native ClamAV/YARA binaries, such as Google Cloud Run, Azure Container Apps, ECS/Fargate, or Kubernetes. A plain Cloudflare Worker is not sufficient for local ClamAV scanning because Workers cannot execute these native binaries.

Place the service behind HTTPS and a WAF/API gateway. Add per-IP/session throttling, request IDs, centralized audit logs, monitoring, and alerts. For regulated production workloads, add a sandbox/CDR service for active-content documents and treat password-protected/encrypted archives as manual-review items.
