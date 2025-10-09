// functions/api/send-email.js
// Cloudflare Pages Function: POST /api/send-email
// Uses SendGrid REST API via SENDGRID_API_KEY in env (.dev.vars for local dev)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",                 // tighten to your domain if you want
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

// ────────────────────────────────────────────────────────────────────────────────
// GET: health check. Useful to confirm route is alive.
// ────────────────────────────────────────────────────────────────────────────────
export async function onRequestGet() {
  return new Response(JSON.stringify({ ok: true, route: "/api/send-email" }), {
    status: 200,
    headers: CORS_HEADERS,
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// OPTIONS: CORS preflight
// ────────────────────────────────────────────────────────────────────────────────
export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// ────────────────────────────────────────────────────────────────────────────────
// POST: send email via SendGrid
// body = { to, subject, html, attachment?, cc?, bcc? }
// ────────────────────────────────────────────────────────────────────────────────
export async function onRequestPost({ request, env }) {
  try {
    if (!env.SENDGRID_API_KEY) {
      return json({ error: "Missing SENDGRID_API_KEY" }, 500);
    }

    // Ensure JSON
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
      // This must be a verified Single Sender or a verified domain in your SendGrid account
      from: { email: "noreply@nfp-sport.org", name: "NFP Sport" },

      // You can add a text fallback if you want:
      // content: [{ type: "text/plain", value: stripHtml(html) }, { type: "text/html", value: html }],
      content: [{ type: "text/html", value: html }],
    };

    // Optional attachment: { contentBase64, filename, mimeType }
    const att = body.attachment;
    if (att && att.contentBase64 && att.filename) {
      msg.attachments = [
        {
          content: att.contentBase64, // base64 string ONLY (no "data:*;base64," prefix)
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
      return json({ error: "SendGrid error", detail: text }, 502);
    }

    return json({ ok: true }, 200);
  } catch (e) {
    return json({ error: e?.message || "Server error" }, 500);
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────
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

// Optional: super basic HTML stripper if you want a text part
// function stripHtml(html) {
//   return String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
// }
