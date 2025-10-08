// src/composables/auth.js (Firebase version)
import { ref, onMounted } from "vue";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const currentUser = ref(null);

async function loadProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function initAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        currentUser.value = null;
        return resolve();
      }
      const profile = await loadProfile(fbUser.uid);
      currentUser.value = {
        uid: fbUser.uid,
        email: fbUser.email,
        username: profile?.username || fbUser.email?.split("@")[0],
        firstName: profile?.firstName || "",
        lastName: profile?.lastName || "",
        role: profile?.role || "member",
      };
      resolve();
    });
  });
}

export function useAuth() {
  async function register({ email, password, username, firstName = "", lastName = "" }) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    // displayName optional, helpful for UI
    await updateProfile(cred.user, { displayName: username });

    // create profile doc with default role
    await setDoc(doc(db, "users", cred.user.uid), {
      username, email, firstName, lastName, role: "member", createdAt: new Date().toISOString(),
    });

    currentUser.value = { uid: cred.user.uid, email, username, firstName, lastName, role: "member" };
    return currentUser.value;
  }

  async function login({ emailOrUsername, password }) {
    // For simplicity: if it looks like an email, sign in directly; otherwise look up email by username.
    let email = emailOrUsername;
    if (!emailOrUsername.includes("@")) {
      // username lookup
      // (simple client query would require an index; for now ask users to log in with email for Part C)
      throw new Error("Please log in with your email address.");
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = await loadProfile(cred.user.uid);
    currentUser.value = {
      uid: cred.user.uid,
      email: cred.user.email,
      username: profile?.username || cred.user.email.split("@")[0],
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      role: profile?.role || "member",
    };
    return currentUser.value;
  }

  async function logout() {
    await signOut(auth);
    currentUser.value = null;
  }

  // Admin: change role in Firestore
  async function setRole(uid, role) {
    await setDoc(
      doc(db, "users", uid),
      { role },
      { merge: true }
    );
    if (currentUser.value?.uid === uid) currentUser.value.role = role;
  }

  return { currentUser, register, login, logout, setRole };
}
