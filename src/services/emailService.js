const API_BASE = import.meta.env.DEV ? "http://127.0.0.1:8788" : "";

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

  const res = await fetch(`${API_BASE}/api/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html, attachment }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${detail}`);
  }
  return res.json();
}
