<template>
  <div id="main" class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Programs Map</h3>
      <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
    </div>

    <div v-if="loading" class="alert alert-info py-2">Loading programs…</div>
    <div v-else>
      <ProgramsMap :programs="programs" />
    </div>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ProgramsMap from "../components/ProgramsMap.vue";
import { listPrograms } from "../services/programsService";

const programs = ref([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const raw = await listPrograms();
    // 👇 Force lat/lng to numbers to be safe + filter junk
    programs.value = raw
      .map(p => ({
        ...p,
        lat: Number(p.lat),
        lng: Number(p.lng),
      }))
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.active !== false);

    console.log("[MapView] received docs:", raw.length,
                "valid features (numeric lat/lng):", programs.value.length);
  } catch (e) {
    console.error(e);
    error.value = e?.message || "Failed to load programs.";
  } finally {
    loading.value = false;
  }
});
</script>
