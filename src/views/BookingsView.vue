<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Book a Session</h3>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
    </div>

    <div class="alert alert-info py-2" v-if="status">{{ status }}</div>
    <div class="alert alert-danger py-2" v-if="error">{{ error }}</div>

    <div ref="calEl" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "../composables/auth";
import { listPrograms } from "../services/programsService";
import { createBooking } from "../services/bookingsService";

// FullCalendar v6 (no CSS imports needed)
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const calEl = ref(null);
const status = ref("");
const error = ref("");

const { currentUser } = useAuth();
let programs = [];

onMounted(async () => {
  try {
    programs = await listPrograms();

    const cal = new Calendar(calEl.value, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: "dayGridMonth",
      selectable: true,
      selectMirror: true,
      dateClick: async (info) => {
        error.value = ""; status.value = "";
        if (!currentUser.value?.uid) {
          error.value = "Please log in to book.";
          return;
        }

        const p = programs.find(x => x.active !== false);
        if (!p) { error.value = "No active programs found."; return; }

        const startDt = new Date(info.dateStr + "T10:00:00");
        const start = startDt.toISOString();
        const end = new Date(startDt.getTime() + 60 * 60 * 1000).toISOString();

        try {
          await createBooking({ uid: currentUser.value.uid, programId: p.id, start, end });
          status.value = "✅ Booked!";
        } catch (e) {
          error.value = e.message || "Failed to create booking";
        }
      },
    });

    cal.render();
  } catch (e) {
    error.value = e?.message || "Failed to load calendar";
  }
});
</script>
