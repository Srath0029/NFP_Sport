<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Book a Session</h3>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
    </div>

    <!-- Controls -->
    <div class="row g-2 align-items-end mb-3">
      <div class="col-md-6">
        <label class="form-label">Program</label>
        <select v-model="selectedProgramId" class="form-select">
          <option disabled value="">Select a program…</option>
          <option v-for="p in programs" :key="p.id" :value="p.id">
            {{ p.title }} — {{ p.suburb || 'Unknown suburb' }}
          </option>
        </select>
      </div>
      <div class="col-md-6">
        <small class="text-muted">Click a day in the calendar to book 10:00–11:00.</small>
      </div>
    </div>

    <div class="alert alert-info py-2" v-if="status">{{ status }}</div>
    <div class="alert alert-danger py-2" v-if="error">{{ error }}</div>

    <div ref="calEl"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "../composables/auth";
import { listPrograms } from "../services/programsService";
import { createBooking, listMyBookings } from "../services/bookingsService";

// FullCalendar v6 (JS only; CSS comes from index.html)
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const calEl = ref(null);
const status = ref("");
const error = ref("");

const { currentUser } = useAuth();

const programs = ref([]);
const selectedProgramId = ref("");

// cache my existing bookings for duplicate check
const myBookings = ref([]); // [{start, end, programId, ...}]

function isPastDate(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return d < today;
}

function alreadyBooked(dateStr, programId) {
  return myBookings.value.some((b) => {
    const d = new Date(b.start);
    const isoDay = d.toISOString().slice(0, 10);
    return isoDay === dateStr && b.programId === programId;
  });
}

onMounted(async () => {
  try {
    // load active programs
    const all = await listPrograms();
    programs.value = all.filter(
      (p) =>
        p.active !== false &&
        Number.isFinite(parseFloat(p.lat)) &&
        Number.isFinite(parseFloat(p.lng))
    );
    if (programs.value.length) selectedProgramId.value = programs.value[0].id;

    // preload my bookings (if logged in)
    if (currentUser.value?.uid) {
      myBookings.value = await listMyBookings(currentUser.value.uid);
    }

    const cal = new Calendar(calEl.value, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      selectable: true,
      selectMirror: true,
      dateClick: async (info) => {
        error.value = "";
        status.value = "";

        if (!currentUser.value?.uid) {
          error.value = "Please log in to book.";
          return;
        }
        if (!selectedProgramId.value) {
          error.value = "Please choose a program first.";
          return;
        }
        if (isPastDate(info.dateStr)) {
          error.value = "You can’t book in the past.";
          return;
        }
        if (alreadyBooked(info.dateStr, selectedProgramId.value)) {
          error.value =
            "You already have a booking for this program on that day.";
          return;
        }

        // 1-hour slot at 10:00 local time
        const startDt = new Date(info.dateStr + "T10:00:00");
        const start = startDt.toISOString();
        const end = new Date(startDt.getTime() + 60 * 60 * 1000).toISOString();

        try {
          await createBooking({
            uid: currentUser.value.uid,
            programId: selectedProgramId.value,
            start,
            end,
          });
          status.value = "✅ Booked!";
          myBookings.value.unshift({
            start,
            end,
            programId: selectedProgramId.value,
          });
        } catch (e) {
          error.value = e.message || "Failed to create booking.";
        }
      },
    });

    cal.render();
  } catch (e) {
    error.value = e?.message || "Failed to load calendar.";
  }
});
</script>
