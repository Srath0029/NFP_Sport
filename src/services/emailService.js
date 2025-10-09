// src/services/emailService.js

export async function sendEmailViaHttp({ to, subject, html, file, cc, bcc }) {
  let attachment = null;

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
    const text = await res.text();
    throw new Error(text || "Failed to send email");
  }
  return res.json();
}

export function textToHtml(text) {
  return String(text || "").replace(/\n/g, "<br>");
}

function fileToBase64NoPrefix(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = reject;
    r.onload = () => {
      const str = String(r.result || "");
      resolve(str.split(",")[1] || "");
    };
    r.readAsDataURL(file);
  });
}
