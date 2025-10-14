// src/services/bookingsService.js
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * ===== HTTPS Cloud Function base =====
 * You can override via .env:
 *   VITE_CF_BASE="https://australia-southeast2-<your-project>.cloudfunctions.net"
 */
const CF_BASE =
  import.meta.env.VITE_CF_BASE ||
  "https://australia-southeast2-fit5032-assignment1.cloudfunctions.net";

// Firestore collection refs
const BOOKINGS_COL = collection(db, "bookings");

/**
 * createBooking
 * Calls your deployed HTTPS function (handles capacity/conflicts/CORS).
 * Body: { uid, programId, start, end }
 * Returns the JSON from the function: { ok: true, id, ... } or throws on error.
 */
export async function createBooking({ uid, programId, start, end }) {
  const res = await fetch(`${CF_BASE}/createBooking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, programId, start, end }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`createBooking failed: HTTP ${res.status} ${txt}`);
  }
  return res.json();
}

/**
 * listMyBookings
 * Returns current user's bookings (newest first).
 */
export async function listMyBookings(uid) {
  const q = query(
    BOOKINGS_COL,
    where("uid", "==", String(uid)),
    orderBy("start", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * listBookingsByProgram (Admin)
 * All bookings for a specific program (newest first).
 */
export async function listBookingsByProgram(programId) {
  const q = query(
    BOOKINGS_COL,
    where("programId", "==", String(programId)),
    orderBy("start", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * listAllBookings (Admin)
 * Every booking (newest first).
 */
export async function listAllBookings() {
  const q = query(BOOKINGS_COL, orderBy("start", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * cancelBooking (Owner/Admin)
 * Soft-cancel by updating status (rules should allow owner/admin).
 */
export async function cancelBooking(id) {
  await updateDoc(doc(db, "bookings", id), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}
