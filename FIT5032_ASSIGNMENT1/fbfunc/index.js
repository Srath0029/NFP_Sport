// fbfunc/index.js
const { onRequest } = require("firebase-functions/v2/https");

// GET https://australia-southeast2-<project>.cloudfunctions.net/serverTime
exports.serverTime = onRequest(
  { region: "australia-southeast2", cors: true },
  (req, res) => {
    res.json({
      ok: true,
      time: new Date().toISOString(),
      source: "Firebase Cloud Functions v2"
    });
  }
);
