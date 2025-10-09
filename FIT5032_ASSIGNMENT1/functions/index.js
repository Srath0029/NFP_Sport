const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

try { admin.initializeApp(); } catch (_) {}

sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Callable function: sendEmail
 * data = { to, subject, html, attachment?: { contentBase64, filename, mimeType } }
 * Only allow authenticated requests; (optional) restrict to admin role if you store roles in Firestore.
 */
exports.sendEmail = functions.https.onCall(async (data, context) => {
  // Require auth
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "You must be signed in.");
  }

  const { to, subject, html, attachment } = data || {};
  if (!to || !subject || !html) {
    throw new functions.https.HttpsError("invalid-argument", "to, subject and html are required.");
  }

  // (Optional) role check example
  // const uid = context.auth.uid;
  // const userDoc = await admin.firestore().doc(`users/${uid}`).get();
  // const role = userDoc.exists ? userDoc.data().role : "member";
  // if (role !== "admin") {
  //   throw new functions.https.HttpsError("permission-denied", "Admins only.");
  // }

  const msg = {
    to,
    from: { email: "noreply@nfp-sport.org", name: "NFP Sport" }, // <-- use your verified sender
    subject,
    html,
  };

  if (attachment && attachment.contentBase64 && attachment.filename) {
    msg.attachments = [{
      content: attachment.contentBase64, // base64 string (no data: prefix)
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
