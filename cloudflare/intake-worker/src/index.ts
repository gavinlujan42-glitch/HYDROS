import { Container, getRandom } from "@cloudflare/containers";

export interface Env {
  QUARANTINE: R2Bucket;
  CLEAN: R2Bucket;
  SCAN_REPORTS: R2Bucket;
  MALWARE_SCANNER: DurableObjectNamespace<MalwareScanner>;
  ALLOWED_ORIGIN: string;
  MAX_UPLOAD_BYTES: string;
}

export class MalwareScanner extends Container<Env> {
  defaultPort = 8080;
  sleepAfter = "2m";
}

const BLOCKED = new Set(["exe","dll","com","scr","msi","bat","cmd","ps1","js","jse","vbs","vbe","wsf","hta","jar","apk","iso","img"]);
const ALLOWED = new Set(["pdf","doc","docx","xls","xlsx","ppt","pptx","txt","csv","jpg","jpeg","png","tif","tiff","zip","gpkg"]);

function cors(env: Env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-File-Name,X-Category,X-Tracking-ID",
    "Access-Control-Max-Age": "86400"
  };
}

function json(env: Env, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...cors(env) }
  });
}

function safeName(input: string) {
  return (input || "upload.bin").split(/[\\/]/).pop()!.replace(/[^A-Za-z0-9._() -]/g, "_").slice(0, 180);
}

function ext(name: string) {
  const i = name.lastIndexOf(".");
  return i < 0 ? "" : name.slice(i + 1).toLowerCase();
}

function keyFor(prefix: string, tracking: string, name: string) {
  const day = new Date().toISOString().slice(0, 10);
  return `${prefix}/${day}/${tracking}/${crypto.randomUUID()}__${name}`;
}

async function sha256Hex(bytes: ArrayBuffer) {
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return json(env, { status: "ok", service: "hydros-secure-intake", storage: "r2", scanner: "clamav+yara-container" });
    }

    if (url.pathname !== "/v1/upload" || request.method !== "POST") return json(env, { error: "not_found" }, 404);

    const fileName = safeName(request.headers.get("x-file-name") || "upload.bin");
    const extension = ext(fileName);
    if (!ALLOWED.has(extension) || BLOCKED.has(extension)) return json(env, { error: "file_type_not_allowed" }, 415);

    const contentLength = Number(request.headers.get("content-length") || 0);
    const max = Number(env.MAX_UPLOAD_BYTES || 52428800);
    if (contentLength > max) return json(env, { error: "file_too_large" }, 413);

    const category = (request.headers.get("x-category") || "other").replace(/[^a-z0-9-]/gi, "").slice(0, 40) || "other";
    const tracking = (request.headers.get("x-tracking-id") || `HYD-${Date.now()}`).replace(/[^A-Za-z0-9-]/g, "").slice(0, 64);
    const mime = request.headers.get("content-type") || "application/octet-stream";

    const bytes = await request.arrayBuffer();
    if (bytes.byteLength > max) return json(env, { error: "file_too_large" }, 413);
    const digest = await sha256Hex(bytes);
    const quarantineKey = keyFor("quarantine", tracking, fileName);

    await env.QUARANTINE.put(quarantineKey, bytes, {
      httpMetadata: { contentType: mime },
      customMetadata: {
        tracking,
        category,
        originalName: fileName,
        sha256: digest,
        state: "QUARANTINED",
        uploadedAt: new Date().toISOString()
      }
    });

    let scanResponse: Response;
    try {
      const scanner = await getRandom(env.MALWARE_SCANNER, 3);
      scanResponse = await scanner.fetch(new Request("http://scanner/scan", {
        method: "POST",
        headers: {
          "content-type": mime,
          "x-file-name": fileName,
          "x-sha256": digest
        },
        body: bytes
      }));
    } catch (error) {
      await env.SCAN_REPORTS.put(`reports/${tracking}/${crypto.randomUUID()}.json`, JSON.stringify({ tracking, quarantineKey, sha256: digest, status: "scanner_unavailable", at: new Date().toISOString() }), { httpMetadata: { contentType: "application/json" } });
      return json(env, { status: "quarantined", tracking_id: tracking, sha256: digest, error: "scanner_unavailable" }, 503);
    }

    const scan = await scanResponse.json<any>();
    const reportKey = `reports/${tracking}/${crypto.randomUUID()}.json`;
    await env.SCAN_REPORTS.put(reportKey, JSON.stringify({ tracking, quarantineKey, sha256: digest, scan, at: new Date().toISOString() }), { httpMetadata: { contentType: "application/json" } });

    if (!scanResponse.ok || scan.clean !== true) {
      return json(env, { status: "rejected", tracking_id: tracking, sha256: digest, scan: { clamav: scan.clamav, yara: scan.yara }, quarantine_key: quarantineKey }, 422);
    }

    const cleanKey = keyFor(`approved/${category}`, tracking, fileName);
    await env.CLEAN.put(cleanKey, bytes, {
      httpMetadata: { contentType: mime },
      customMetadata: {
        tracking,
        category,
        originalName: fileName,
        sha256: digest,
        state: "APPROVED_CLEAN",
        clamav: "clean",
        yara: "clean",
        approvedAt: new Date().toISOString()
      }
    });
    await env.QUARANTINE.delete(quarantineKey);

    return json(env, {
      status: "clean_and_stored",
      tracking_id: tracking,
      file: { name: fileName, size: bytes.byteLength, mime, sha256: digest },
      storage: { provider: "Cloudflare R2", bucket: "hydros-approved", key: cleanKey },
      scan: { clamav: scan.clamav, yara: scan.yara, archive: scan.archive }
    });
  }
} satisfies ExportedHandler<Env>;
