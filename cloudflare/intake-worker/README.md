# HYDROS Secure Intake on Cloudflare

This service provides a seamless public upload path for HYDROS using Cloudflare Workers, private R2 buckets, and a Cloudflare Container running ClamAV and YARA.

## Flow

1. Browser uploads to `POST /v1/upload` on the Worker.
2. Worker validates extension and size and writes the bytes to `hydros-quarantine`.
3. Worker sends the same bytes and SHA-256 to the scanner Container.
4. Container checks archive safety, ClamAV signatures, YARA rules, and the hash.
5. Clean files are written to `hydros-approved` and deleted from quarantine.
6. Scan reports are written to `hydros-scan-reports`.
7. Rejected or scanner-error files are never promoted to the approved bucket.

R2 bindings are used instead of storage access keys, so the Worker code contains no R2 credentials.

## GitHub Actions activation

Configure these repository secrets:

- `CLOUDFLARE_API_TOKEN` — token with Workers Scripts, Workers Containers, and R2 bucket permissions needed by Wrangler.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account identifier.
- `CLOUDFLARE_WORKERS_SUBDOMAIN` — the Workers subdomain portion used by `*.workers.dev`.

Then run **Actions → Deploy HYDROS Cloudflare Intake → Run workflow**.

The workflow creates the three private R2 buckets if needed, deploys the Worker and scanner container, updates `gh-pages/hydros-config.js` with the live Worker URL, and performs a health check.

## Local deployment

```bash
cd cloudflare/intake-worker
npm install
npx wrangler login
npx wrangler r2 bucket create hydros-quarantine
npx wrangler r2 bucket create hydros-approved
npx wrangler r2 bucket create hydros-scan-reports
npx wrangler deploy
```

Docker must be available to build the scanner container during deployment.

## Security notes

- Buckets remain private. Do not enable R2 public bucket access.
- The public website never receives R2 credentials.
- The approved bucket is written only after a clean scan result.
- Scanner failures fail closed.
- Keep ClamAV signatures and YARA rules current.
- Add WAF/rate limiting and identity controls before production public filing use.
- Consider Content Disarm and Reconstruction (CDR) for high-risk Office/PDF inputs in a later hardening phase.
