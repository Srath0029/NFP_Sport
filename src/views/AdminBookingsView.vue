<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Admin • Bookings</h3>
      <div class="d-flex gap-2">
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">Dashboard</RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
      </div>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-12 col-md-4">
        <input v-model="q" class="form-control" placeholder="Search (user/program)">
      </div>
      <div class="col-6 col-md-3">
        <select v-model="programFilter" class="form-select">
          <option value="">All programs</option>
          <option v-for="p in progs" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info py-2">Loading…</div>
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

    <div class="table-responsive" v-if="!loading">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Program</th>
            <th>User</th>
            <th>Start</th>
            <th>End</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filtered" :key="b.id">
            <td>{{ programName(b.programId) }}</td>
            <td><code>{{ b.uid }}</code></td>
            <td>{{ fmt(b.start) }}</td>
            <td>{{ fmt(b.end) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" @click="onCancel(b)" :disabled="busyId===b.id">
                {{ busyId===b.id ? 'Deleting…' : 'Delete' }}
              </button>
            </td>
          </tr>
          <tr v-if="filtered.length===0">
            <td colspan="5" class="text-muted">No results.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue";
import { RouterLink } from "vue-router";
import { listAllBookings, cancelBooking } from "../services/bookingsService";
import { listPrograms } from "../services/programsService";

const bookings = ref([]);
const progs = ref([]);
const loading = ref(true);
const error = ref("");
const busyId = ref("");
const q = ref("");
const programFilter = ref("");

function fmt(iso) { try { return new Date(iso).toLocaleString(); } catch { return iso; } }
function programName(id) { return progs.value.find(p => p.id === id)?.title || id; }

const filtered = computed(() => {
  const term = q.value.toLowerCase();
  return bookings.value.filter(b => {
    if (programFilter.value && b.programId !== programFilter.value) return false;
    const pName = programName(b.programId).toLowerCase();
    return !term || pName.includes(term) || String(b.uid).toLowerCase().includes(term);
  });
});

async function loadAll() {
  loading.value = true; error.value = "";
  try {
    progs.value = await listPrograms();
    bookings.value = await listAllBookings();
  } catch (e) {
    error.value = e?.message || "Failed to load.";
  } finally {
    loading.value = false;
  }
}

async function onCancel(b) {
  if (!confirm("Delete this booking?")) return;
  try {
    busyId.value = b.id;
    await cancelBooking(b.id);
    bookings.value = bookings.value.filter(x => x.id !== b.id);
  } catch (e) {
    alert(e?.message || "Failed to delete.");
  } finally {
    busyId.value = "";
  }
}

onMounted(loadAll);
</script>
