// Cloudflare Pages Function: POST /api/send-email
// Uses SendGrid API with a secret env var. Works on free tier.
// Attachments accepted as base64 (no "data:*;base64," prefix).

export async function onRequestPost({ request, env }) {
  try {
    // Optional: simple auth via shared secret header
    const secret = request.headers.get("x-api-key");
    if (env.API_SHARED_SECRET && secret !== env.API_SHARED_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    const { to, subject, html, attachment, cc, bcc } = body || {};

    if (!to || !subject || !html) {
      return new Response(JSON.stringify({ error: "Missing to/subject/html" }), { status: 400 });
    }

    const msg = {
      personalizations: [{
        to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }],
        ...(Array.isArray(cc) && cc.length ? { cc: cc.map(e => ({ email: e })) } : {}),
        ...(Array.isArray(bcc) && bcc.length ? { bcc: bcc.map(e => ({ email: e })) } : {}),
      }],
      from: { email: "noreply@nfp-sport.org", name: "NFP Sport" }, // must be verified in SendGrid
      subject,
      content: [{ type: "text/html", value: html }],
    };

    if (attachment && attachment.contentBase64 && attachment.filename) {
      msg.attachments = [{
        content: attachment.contentBase64,       // base64 only
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
