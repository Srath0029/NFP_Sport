<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">My Bookings</h3>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/bookings">Book</RouterLink>
    </div>

    <div class="alert alert-info py-2" v-if="loading">Loading…</div>
    <div class="alert alert-danger py-2" v-if="error">{{ error }}</div>

    <div class="table-responsive" v-if="!loading">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Program</th>
            <th>Start</th>
            <th>End</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in rows" :key="b.id">
            <td>{{ programTitle(b.programId) }}</td>
            <td>{{ fmt(b.start) }}</td>
            <td>{{ fmt(b.end) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" @click="doCancel(b)" :disabled="busyId===b.id">
                {{ busyId===b.id ? 'Cancelling…' : 'Cancel' }}
              </button>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="4" class="text-muted">No bookings yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "../composables/auth";
import { listPrograms } from "../services/programsService";
import { listMyBookings, cancelBooking } from "../services/bookingsService";

const { currentUser } = useAuth();
const rows = ref([]);
const progs = ref([]);
const loading = ref(true);
const error = ref("");
const busyId = ref("");

function fmt(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function programTitle(id) {
  const p = progs.value.find(x => x.id === id);
  return p ? p.title : "(unknown)";
}

async function load() {
  loading.value = true; error.value = "";
  try {
    progs.value = await listPrograms();
    if (!currentUser.value?.uid) {
      error.value = "Please log in.";
      return;
    }
    rows.value = await listMyBookings(currentUser.value.uid);
  } catch (e) {
    error.value = e?.message || "Failed to load bookings.";
  } finally {
    loading.value = false;
  }
}

async function doCancel(b) {
  if (!confirm("Cancel this booking?")) return;
  try {
    busyId.value = b.id;
    await cancelBooking(b.id);
    rows.value = rows.value.filter(x => x.id !== b.id);
  } catch (e) {
    alert(e?.message || "Failed to cancel.");
  } finally {
    busyId.value = "";
  }
}

onMounted(load);
</script>
