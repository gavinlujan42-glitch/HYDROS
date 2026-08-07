# HYDROS Secure Intake Security Contract

HYDROS file intake is fail-closed. The browser must never upload directly to Google Drive.

## Required processing order

1. HTTPS upload to the intake API.
2. Temporary quarantine only.
3. Filename normalization and allowlist/denylist checks.
4. Server-side MIME inspection using libmagic.
5. Archive safety checks: file count, expanded size, compression ratio, path traversal, nested blocked types.
6. SHA-256 calculation.
7. ClamAV signature scan. Scanner failure is a service failure, never a pass.
8. YARA rule scan. Scanner failure is a service failure, never a pass.
9. Only a clean file may be created in the approved Google Drive destination.
10. Temporary bytes are destroyed when the request exits.

## Production hardening requirements

- Refresh ClamAV signatures continuously and alert when definitions are stale.
- Mount and maintain organization-approved YARA rules.
- Add CDR/sandboxing for PDFs and Office documents before production acceptance.
- Reject or manually review encrypted/password-protected archives and documents.
- Put Cloud Armor/API gateway or equivalent rate limiting in front of the service.
- Require bot/abuse protections and per-user/request quotas for public use.
- Record immutable scan metadata: timestamp, SHA-256, engines/versions, signature age, decision, category, tracking ID and Drive file ID.
- Never log document contents, credentials, PAN/CVV, or unnecessary PII.
- Use a dedicated runtime identity. No JSON service-account key may be committed to GitHub or exposed to browser JavaScript.
- Grant the runtime identity access only to approved HYDROS Drive folders.
- Malware detections must not be promoted to Drive. Preserve a sanitized scan-event record, not the malicious payload, unless an approved incident-response process explicitly requires evidence retention in a purpose-built malware repository.

## Accepted types

PDF, common Office formats, text/CSV, JPG/PNG/TIFF, ZIP and GeoPackage are allowed by the prototype. Executables, scripts, disk images, APK/JAR and similar active types are blocked.

This prototype is not an authorization to accept sensitive or legally protected data. Agency security, privacy, records, legal and data-governance owners must approve the production data classes and retention rules.
