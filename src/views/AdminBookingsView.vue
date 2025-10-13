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
      <div class="col-md-4">
        <input v-model="q" class="form-control" placeholder="Search (user email/uid, program title)">
      </div>
      <div class="col-md-4">
        <select v-model="selectedProgram" class="form-select">
          <option value="">All programs</option>
          <option v-for="p in progs" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
      </div>
      <div class="col-md-4 text-end">
        <button class="btn btn-sm btn-outline-success" @click="exportCsv" :disabled="rows.length===0">Export CSV</button>
      </div>
    </div>

    <div class="alert alert-info py-2" v-if="loading">Loading…</div>
    <div class="alert alert-danger py-2" v-if="error">{{ error }}</div>

    <div class="table-responsive" v-if="!loading">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Program</th><th>User</th><th>Start</th><th>End</th><th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in filtered" :key="b.id">
            <td>{{ title(b.programId) }}</td>
            <td><small>{{ b.uid }}</small></td>
            <td>{{ fmt(b.start) }}</td>
            <td>{{ fmt(b.end) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" @click="remove(b)" :disabled="busyId===b.id">
                Delete
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
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { listPrograms } from "../services/programsService";
import { listAllBookings, listBookingsByProgram, cancelBooking } from "../services/bookingsService";

const loading = ref(true);
const error = ref("");
const rows = ref([]);
const progs = ref([]);
const selectedProgram = ref("");
const q = ref("");
const busyId = ref("");

function fmt(iso) { try { return new Date(iso).toLocaleString(); } catch { return iso; } }
function title(id) { const p = progs.value.find(x => x.id === id); return p ? p.title : "(unknown)"; }

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase();
  return rows.value.filter(r => {
    const hay = `${title(r.programId)} ${r.uid}`.toLowerCase();
    return (!term || hay.includes(term)) &&
           (!selectedProgram.value || r.programId === selectedProgram.value);
  });
});

async function load() {
  loading.value = true; error.value = "";
  try {
    progs.value = await listPrograms();
    // default to all bookings
    rows.value = await listAllBookings();
  } catch (e) {
    error.value = e?.message || "Failed to load bookings.";
  } finally {
    loading.value = false;
  }
}

async function remove(b) {
  if (!confirm("Delete this booking?")) return;
  try {
    busyId.value = b.id;
    await cancelBooking(b.id);
    rows.value = rows.value.filter(x => x.id !== b.id);
  } catch (e) {
    alert(e?.message || "Failed to delete.");
  } finally {
    busyId.value = "";
  }
}

function exportCsv() {
  const headers = ["program","uid","start","end"];
  const lines = [headers.join(",")];
  filtered.value.forEach(b => {
    lines.push([JSON.stringify(title(b.programId)), b.uid, b.start, b.end].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "bookings.csv"; a.click();
  URL.revokeObjectURL(url);
}

onMounted(load);
</script>
