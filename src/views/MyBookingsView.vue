<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">My Bookings</h3>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
    </div>

    <div v-if="loading" class="alert alert-info py-2">Loading…</div>
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

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
          <tr v-for="b in bookings" :key="b.id">
            <td>{{ programName(b.programId) }}</td>
            <td>{{ fmt(b.start) }}</td>
            <td>{{ fmt(b.end) }}</td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" @click="onCancel(b)" :disabled="busyId===b.id">
                {{ busyId===b.id ? 'Cancelling…' : 'Cancel' }}
              </button>
            </td>
          </tr>
          <tr v-if="bookings.length===0">
            <td colspan="4" class="text-muted">No bookings yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "../composables/auth";
import { listUserBookings, cancelBooking } from "../services/bookingsService";
import { listPrograms } from "../services/programsService";

const { currentUser } = useAuth();
const bookings = ref([]);
const progs = ref([]);
const loading = ref(true);
const error = ref("");
const busyId = ref("");

function fmt(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}
function programName(id) {
  const p = progs.value.find(x => x.id === id);
  return p?.title || id;
}

async function loadAll() {
  loading.value = true; error.value = "";
  try {
    progs.value = await listPrograms();
    if (!currentUser.value?.uid) { error.value = "Please log in."; return; }
    bookings.value = await listUserBookings(currentUser.value.uid);
  } catch (e) {
    error.value = e?.message || "Failed to load bookings.";
  } finally {
    loading.value = false;
  }
}

async function onCancel(b) {
  if (!confirm("Cancel this booking?")) return;
  try {
    busyId.value = b.id;
    await cancelBooking(b.id);
    bookings.value = bookings.value.filter(x => x.id !== b.id);
  } catch (e) {
    alert(e?.message || "Failed to cancel.");
  } finally {
    busyId.value = "";
  }
}

onMounted(loadAll);
</script>
