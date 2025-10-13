// fbfunc/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const REGION = "australia-southeast2";

exports.createBooking = functions
  .region(REGION)
  .https.onRequest(async (req, res) => {
    try {
      // CORS (allow your dev + prod origins; keep * for quick testing)
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "POST,OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") return res.status(204).send();

      if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
      }

      const auth = req.headers.authorization || "";
      // Optional: if you want to require Firebase ID token, parse "Bearer <token>" here
      // For assignment simplicity we’ll just require a uid in body:
      const { uid, programId, start, end } = req.body || {};
      if (!uid || !programId || !start || !end) {
        return res.status(400).json({ error: "Missing uid, programId, start, end" });
      }

      const startTs = new Date(start).getTime();
      const endTs = new Date(end).getTime();
      if (!isFinite(startTs) || !isFinite(endTs) || endTs <= startTs) {
        return res.status(400).json({ error: "Invalid start/end" });
      }

      // Load program
      const progSnap = await db.collection("programs").doc(programId).get();
      if (!progSnap.exists) return res.status(404).json({ error: "Program not found" });
      const prog = progSnap.data();
      if (prog.active === false) return res.status(400).json({ error: "Program inactive" });

      const capacity = Number(prog.capacity) || 0;

      // Time overlap helper
      const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

      // Query bookings overlapping this slot for the same program
      const bookingsRef = db.collection("bookings");
      const byProgram = await bookingsRef
        .where("programId", "==", programId)
        .where("status", "in", ["pending", "confirmed"])
        .get();

      const conflictingForProgram = byProgram.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => overlaps(startTs, endTs, new Date(b.start).getTime(), new Date(b.end).getTime()));

      if (capacity > 0 && conflictingForProgram.length >= capacity) {
        return res.status(409).json({ error: "Program at capacity for this time" });
      }

      // Prevent user from double-booking overlapping slot (any program)
      const byUser = await bookingsRef
        .where("uid", "==", uid)
        .where("status", "in", ["pending", "confirmed"])
        .get();

      const conflictingForUser = byUser.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .some(b => overlaps(startTs, endTs, new Date(b.start).getTime(), new Date(b.end).getTime()));

      if (conflictingForUser) {
        return res.status(409).json({ error: "You already have a booking that overlaps this time" });
      }

      // Create booking
      const payload = {
        uid,
        programId,
        start: new Date(startTs).toISOString(),
        end: new Date(endTs).toISOString(),
        status: "confirmed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await bookingsRef.add(payload);

      return res.status(200).json({ ok: true, id: docRef.id, ...payload });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || "Server error" });
    }
  });
