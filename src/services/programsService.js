// src/services/programsService.js
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const col = collection(db, "programs");

// Coerce fields so the UI (map/table) always gets consistent types
function coerceProgram(p = {}) {
  const days =
    Array.isArray(p.days)
      ? p.days
      : typeof p.days === "string"
      ? p.days.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const numOrNull = (v) =>
    v === undefined || v === null || v === "" ? null : Number(v);

  return {
    ...p,
    days,
    lat: numOrNull(p.lat),
    lng: numOrNull(p.lng),
    capacity: numOrNull(p.capacity),
    active: p.active !== false, // default true
  };
}

export async function listPrograms() {
  const q = query(col, orderBy("title"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...coerceProgram(d.data()) }));
}

// 🔴 Realtime stream: unsubscribe() the return value in onBeforeUnmount
export function streamPrograms(callback) {
  const q = query(col, orderBy("title"));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map((d) => ({ id: d.id, ...coerceProgram(d.data()) }));
    callback(rows);
  });
}

export async function createProgram(data) {
  const payload = coerceProgram({
    title: "",
    type: "",
    days: [],
    address: "",
    suburb: "",
    lat: null,
    lng: null,
    capacity: null,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...data,
  });
  const ref = await addDoc(col, payload);
  return { id: ref.id, ...payload };
}

export async function updateProgram(id, data) {
  const ref = doc(db, "programs", id);
  const payload = {
    ...coerceProgram(data),
    updatedAt: serverTimestamp(),
  };
  await updateDoc(ref, payload);
}

export async function deleteProgramById(id) {
  const ref = doc(db, "programs", id);
  await deleteDoc(ref);
}
