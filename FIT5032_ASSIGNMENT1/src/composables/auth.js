// src/composables/auth.js
import { ref } from "vue";

const USERS_KEY = "auth_users_v1";
const SESSION_KEY = "auth_session_v1";

const currentUser = ref(JSON.parse(localStorage.getItem(SESSION_KEY) || "null"));

function b64(bytes) { return btoa(String.fromCharCode(...bytes)); }
function fromB64(b64str) { return Uint8Array.from(atob(b64str), c => c.charCodeAt(0)); }

/** PBKDF2-SHA256 password hashing */
async function hashPassword(password, saltB64) {
  const enc = new TextEncoder();
  const salt = saltB64 ? fromB64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const iterations = 150_000;
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, keyMaterial, 256);
  const hash = b64(new Uint8Array(bits));
  return { hash, salt: b64(salt), iterations };
}

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

export async function initAuth() {
  // Seed an initial admin the very first time (username: admin / password: Admin123!)
  const users = loadUsers();
  if (users.length === 0) {
    const { hash, salt, iterations } = await hashPassword("Admin123!");
    users.push({
      id: crypto.randomUUID(),
      username: "admin",
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      pass: { hash, salt, iterations },
      createdAt: new Date().toISOString()
    });
    saveUsers(users);
  }
  currentUser.value = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
}

export function useAuth() {
  async function register({ username, email, password, firstName = "", lastName = "", role = "member" }) {
    const users = loadUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username already exists");
    }
    const { hash, salt, iterations } = await hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      username, email, firstName, lastName,
      role,
      pass: { hash, salt, iterations },
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);

    // Auto-login after register
    currentUser.value = { id: user.id, username, email, firstName, lastName, role };
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.value));
    return currentUser.value;
  }

  async function login({ username, password }) {
    const users = loadUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("Invalid credentials");
    const { hash } = await hashPassword(password, user.pass.salt);
    if (hash !== user.pass.hash) throw new Error("Invalid credentials");

    currentUser.value = {
      id: user.id, username: user.username, email: user.email,
      firstName: user.firstName, lastName: user.lastName, role: user.role
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.value));
    return currentUser.value;
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem(SESSION_KEY);
  }

  function getUsers() { return loadUsers(); }

  function setRole(userId, role) {
    const users = loadUsers();
    const u = users.find(x => x.id === userId);
    if (u) {
      u.role = role;
      saveUsers(users);
      if (currentUser.value?.id === userId) {
        currentUser.value.role = role;
        localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser.value));
      }
    }
  }

  return { currentUser, register, login, logout, getUsers, setRole };
}
