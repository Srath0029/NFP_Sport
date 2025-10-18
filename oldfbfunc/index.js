// fbfunc/index.js
// Firebase Functions v2 (2nd gen)
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

admin.initializeApp();

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  // add your prod domain when deployed, e.g.:
  // "https://your-cloudflare-pages-domain.pages.dev"
];

// Minimal CORS wrapper for onRequest functions
function withCors(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      // Preflight
      return res.status(204).send("");
    }
    return handler(req, res);
  };
}

exports.createBooking = onRequest(
  { region: "australia-southeast2" },
  withCors(async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Use POST" });
    }

    try {
      const db = getFirestore();
      const { uid, programId, start, end } = req.body || {};

      if (!uid || !programId || !start || !end) {
        return res.status(400).json({ error: "Missing uid, programId, start, end" });
      }

      // TODO: (optional) add conflict checks for the selected time/program

      const docRef = await db.collection("bookings").add({
        uid,
        programId,
        start,
        end,
        createdAt: FieldValue.serverTimestamp(),
      });

      return res.status(200).json({ ok: true, id: docRef.id });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e?.message || "Server error" });
    }
  })
);
