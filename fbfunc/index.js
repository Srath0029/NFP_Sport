// fbfunc/index.js
const { onRequest } = require("firebase-functions/v2/https");

// Simple HTTPS function: GET https://<region>-<project>.cloudfunctions.net/serverTime
exports.serverTime = onRequest({ region: "australia-southeast2", cors: true }, (req, res) => {
  res.json({ ok: true, time: new Date().toISOString(), source: "Firebase Cloud Functions v2" });
});
