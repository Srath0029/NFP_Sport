<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Admin • User Directory</h3>
      <div class="d-flex gap-2">
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/profile">Profile</RouterLink>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info py-2 mb-3">Loading users…</div>
    <div v-if="error" class="alert alert-danger py-2 mb-3">
      {{ error }} — Check Firestore rules or your admin role.
    </div>

    <div class="table-responsive" v-if="!loading && !error">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>Username</th><th>Email</th><th>Role</th><th>Joined</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.username || '(no username)' }}</td>
            <td>{{ u.email }}</td>
            <td><span class="badge" :class="u.role === 'admin' ? 'bg-primary' : 'bg-secondary'">{{ u.role }}</span></td>
            <td>{{ formatDate(u.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="users.length === 0" class="text-muted">No users found.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const users = ref([]);
const loading = ref(true);
const error = ref("");

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, "users"));
    users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    error.value = e.message || "Failed to load users.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Ensure nothing overlays the navbar: keep default static positioning */
</style>
