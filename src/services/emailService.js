// src/services/emailService.js
export async function sendEmailViaHttp({ to, subject, html, file, cc, bcc }) {
  let attachment;
  if (file instanceof File) {
    const base64 = await fileToBase64NoPrefix(file);
    attachment = {
      contentBase64: base64,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
    };
  }

  const res = await fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html, attachment, cc, bcc }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail || err?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

function fileToBase64NoPrefix(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const s = String(reader.result); // "data:<mime>;base64,AAAA..."
      resolve(s.split(",")[1] || "");  // strip prefix
    };
    reader.readAsDataURL(file);
  });
}
