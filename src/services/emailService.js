// src/services/emailService.js
// Works with your Cloudflare Pages Function at /api/send-email

const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8788" : "";

/** Low-level sender (single request). Accepts a single email or an array. */
export async function sendEmailViaHttp({ to, subject, html, file }) {
  let attachment;
  if (file instanceof File) {
    const base64 = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = reject;
      r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
      r.readAsDataURL(file);
    });
    attachment = {
      contentBase64: base64,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
    };
  }

  // allow string OR array for "to" (your CF function supports arrays)
  const payload = { to, subject, html, ...(attachment ? { attachment } : {}) };

  const res = await fetch(`${API_BASE}/api/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${detail}`);
  }
  return res.json();
}

/** High-level bulk helper: paste emails (comma/newline) or pass an array. */
export async function sendBulkEmails({ recipients, subject, html, file }) {
  // normalize string -> array (split by comma or newline)
  const list = Array.isArray(recipients)
    ? recipients
    : String(recipients || "")
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean);

  if (list.length === 0) throw new Error("No recipients provided.");

  // Send in chunks so one request can hit multiple recipients
  const CHUNK = 400; // conservative chunk size
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK);
    await sendEmailViaHttp({ to: chunk, subject, html, file });
  }
}
