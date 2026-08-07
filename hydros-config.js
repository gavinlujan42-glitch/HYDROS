// HYDROS runtime configuration. Cloudflare deployment automation populates uploadApi on gh-pages.
window.HYDROS_CONFIG = Object.freeze({
  uploadApi: "",
  uploadMode: "cloudflare-r2",
  repository: "Cloudflare R2",
  security: "R2 quarantine + ClamAV + YARA + archive validation + SHA-256"
});
