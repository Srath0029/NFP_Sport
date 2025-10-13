// --- add below your existing imports ---
import { db } from "../firebase";
import {
  collection, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp,
} from "firebase/firestore";

const bookingsCol = collection(db, "bookings");

// List bookings for a single program (Admin view)
export async function listBookingsByProgram(programId) {
  const q = query(
    bookingsCol,
    where("programId", "==", String(programId)),
    orderBy("start", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// (Optional) List all bookings (Admin dashboard)
export async function listAllBookings() {
  const q = query(bookingsCol, orderBy("start", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// (Optional) Cancel a booking by id (owner/admin)
export async function cancelBooking(id) {
  await updateDoc(doc(db, "bookings", id), {
    status: "cancelled",
    updatedAt: serverTimestamp(),
  });
}
