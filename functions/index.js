/* eslint-env node */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

try {
  admin.initializeApp();
} catch (e) {
  console.log("Admin already initialized");
}

sgMail.setApiKey(functions.config().sendgrid.key);

exports.sendEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const { to, subject, html, attachment, cc, bcc } = data || {};
  if (!to || !subject || !html) {
    throw new functions.https.HttpsError("invalid-argument", "to, subject and html are required.");
  }

  const msg = {
    to,
    from: { email: "noreply@nfp-sport.org", name: "NFP Sport" }, // verified sender
    subject,
    html,
  };

  if (Array.isArray(cc) && cc.length) msg.cc = cc;
  if (Array.isArray(bcc) && bcc.length) msg.bcc = bcc;

  if (attachment && attachment.contentBase64 && attachment.filename) {
    msg.attachments = [{
      content: attachment.contentBase64,
      filename: attachment.filename,
      type: attachment.mimeType || "application/octet-stream",
      disposition: "attachment",
    }];
  }

  try {
    await sgMail.send(msg);
    return { ok: true };
  } catch (err) {
    console.error("SendGrid error:", err?.response?.body || err);
    throw new functions.https.HttpsError("internal", "Failed to send email.");
  }
});
