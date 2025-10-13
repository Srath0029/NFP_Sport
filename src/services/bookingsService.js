// src/services/bookingsService.js
import { db } from "../firebase";
import {
  collection, query, where, orderBy, getDocs, deleteDoc, doc,
} from "firebase/firestore";

// existing: export async function createBooking(payload) { ... } // via HTTPS fn

const col = collection(db, "bookings");

export async function listUserBookings(uid) {
  const q = query(col, where("uid", "==", uid), orderBy("start", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Admin: list all bookings (optionally filter by programId)
export async function listAllBookings({ programId } = {}) {
  let q = query(col, orderBy("start", "desc"));
  if (programId) {
    q = query(col, where("programId", "==", programId), orderBy("start", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function cancelBooking(id) {
  await deleteDoc(doc(db, "bookings", id));
}
