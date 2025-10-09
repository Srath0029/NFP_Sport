// functions/api/send-email.js
// Cloudflare Pages Function: /api/send-email
// Uses SendGrid REST API with env vars (set .dev.vars locally; set Env Vars in Cloudflare Pages)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*", // tighten to your domain for prod
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

// GET: health check
export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, route: "/api/send-email" }), {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// OPTIONS: CORS preflight
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// POST: send email via SendGrid
// body = { to, subject, html, attachment?, cc?, bcc?, replyTo? }
export async function onRequestPost({ request, env }) {
  try {
    if (!env.SENDGRID_API_KEY) {
      return json({ error: "Missing SENDGRID_API_KEY" }, 500);
    }

    // ✅ These MUST be set; the email must be a verified Single Sender or domain in SendGrid
    const fromEmail = env.SENDGRID_FROM;
    const fromName = env.SENDGRID_FROM_NAME || "NFP Sport";
    if (!fromEmail) {
      return json(
        { error: "Missing SENDGRID_FROM (must be a verified Sender Identity in SendGrid)" },
        500
      );
    }

    const body = await safeJson(request);
    if (!body) return json({ error: "Invalid JSON body" }, 400);

    const { to, subject, html } = body;
    if (!to || !subject || !html) {
      return json({ error: "Missing required fields: to, subject, html" }, 400);
    }

    // Normalize recipients
    const toList = normalizeEmails(to);
    const ccList = normalizeEmails(body.cc);
    const bccList = normalizeEmails(body.bcc);

    // Build SendGrid message
    const msg = {
      personalizations: [
        {
          to: toList.map((e) => ({ email: e })),
          ...(ccList.length ? { cc: ccList.map((e) => ({ email: e })) } : {}),
          ...(bccList.length ? { bcc: bccList.map((e) => ({ email: e })) } : {}),
          subject,
        },
      ],
      from: { email: fromEmail, name: fromName },
      content: [{ type: "text/html", value: html }],
    };

    // Optional reply-to (does not need to be verified)
    if (body.replyTo) {
      const rt = String(body.replyTo).trim();
      if (rt) msg.reply_to = { email: rt };
    }

    // Optional attachment: { contentBase64, filename, mimeType }
    const att = body.attachment;
    if (att && att.contentBase64 && att.filename) {
      msg.attachments = [
        {
          content: att.contentBase64, // base64 only (no data: prefix)
          filename: att.filename,
          type: att.mimeType || "application/octet-stream",
          disposition: "attachment",
        },
      ];
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
      // bubble up sendgrid’s message to make debugging easy
      return json({ error: "SendGrid error", detail: text }, 502);
    }

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: e?.message || "Server error" }, 500);
  }
}

// Helpers
function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS });
}

async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function normalizeEmails(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  return String(v).split(",").map((s) => s.trim()).filter(Boolean);
}
