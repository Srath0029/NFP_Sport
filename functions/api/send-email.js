// Cloudflare Pages Function: POST /api/send-email
// Uses SendGrid REST API with a secret env var. Free on Cloudflare.

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { to, subject, html, attachment, cc, bcc } = body || {};

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "Missing to/subject/html" }), { status: 400 });
    }

    // Build SendGrid payload
    const msg = {
      personalizations: [{
        to: (Array.isArray(to) ? to : [to]).map(e => ({ email: e })),
        ...(Array.isArray(cc) && cc.length ? { cc: cc.map(e => ({ email: e })) } : {}),
        ...(Array.isArray(bcc) && bcc.length ? { bcc: bcc.map(e => ({ email: e })) } : {}),
      }],
      from: { email: "noreply@nfp-sport.org", name: "NFP Sport" }, // <- must be a verified sender in SendGrid
      subject,
      content: [{ type: "text/html", value: html }],
    };

    // Optional attachment: { contentBase64, filename, mimeType }
    if (attachment && attachment.contentBase64 && attachment.filename) {
      msg.attachments = [{
        content: attachment.contentBase64,              // base64 only (no "data:*;base64," prefix)
        filename: attachment.filename,
        type: attachment.mimeType || "application/octet-stream",
        disposition: "attachment",
      }];
    }

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(msg),
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(JSON.stringify({ error: "SendGrid error", detail: text }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e?.message || "Server error" }), { status: 500 });
  }
}
