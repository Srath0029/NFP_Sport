// src/services/emailService.js
const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8788" : "";

export async function sendEmailViaHttp({ to, subject, html, file }) {
  // ✅ accept single email OR comma-separated string OR array
  const toList = Array.isArray(to)
    ? to.filter(Boolean).map(String)
    : String(to || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);

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

  const payload = {
    to: toList,
    subject,
    html,
    ...(attachment ? { attachment } : {}),
  };

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
