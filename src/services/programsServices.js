// src/services/programsService.js
import { db } from "../firebase";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";

const col = collection(db, "programs");

export async function listPrograms() {
  const snap = await getDocs(col);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createProgram(data) {
  const payload = {
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
  };
  const ref = await addDoc(col, payload);
  return { id: ref.id, ...payload };
}

export async function updateProgram(id, data) {
  const ref = doc(db, "programs", id);
  const payload = { ...data, updatedAt: serverTimestamp() };
  await updateDoc(ref, payload);
}

export async function deleteProgramById(id) {
  const ref = doc(db, "programs", id);
  await deleteDoc(ref);
}
