<template>
  <section aria-label="Programs map and routing">
    <div class="d-flex gap-2 mb-2 align-items-center">
      <input
        v-model="query"
        class="form-control"
        placeholder="Search a place (e.g., Footscray Park)"
        @keyup.enter="doSearch"
        aria-label="Search places"
      />
      <button class="btn btn-primary" @click="doSearch">Search</button>
      <button class="btn btn-outline-secondary" @click="routeToSelected" :disabled="!selected">
        Route to selected
      </button>
      <span v-if="status" class="text-muted small ms-2" role="status" aria-live="polite">{{ status }}</span>
    </div>

    <div
      ref="mapRef"
      style="height: 440px; border-radius: 12px; overflow: hidden;"
      aria-label="Interactive map"
      role="region"
    ></div>

    <div class="mt-2">
      <small class="text-muted">Tip: click a program marker to select it, then press “Route to selected”.</small>
    </div>
  </section>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import mapboxgl from "mapbox-gl";

const props = defineProps({
  programs: { type: Array, default: () => [] } // [{id,title,suburb,lat,lng}]
});

const mapRef = ref(null);
let map;
let programMarkers = [];
const selected = ref(null);
const query = ref("");
const status = ref("");

const token = import.meta.env.VITE_MAPBOX_TOKEN;
mapboxgl.accessToken = token;

function setStatus(msg, ms = 2500) {
  status.value = msg;
  if (ms) setTimeout(() => (status.value = ""), ms);
}

function clearMarkers() {
  programMarkers.forEach(m => m.remove());
  programMarkers = [];
}

function addProgramMarkers() {
  clearMarkers();
  props.programs
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
    .forEach(p => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.background = "#0d6efd";

      const mk = new mapboxgl.Marker(el)
        .setLngLat([p.lng, p.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 24 }).setHTML(
            `<strong>${escapeHtml(p.title || "Program")}</strong><br>${escapeHtml(p.suburb || "")}`
          )
        )
        .addTo(map);

      el.tabIndex = 0; // keyboard-focusable
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `Select ${p.title || "program"} for routing`);
      el.addEventListener("click", () => (selected.value = p));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selected.value = p; }
      });

      programMarkers.push(mk);
    });
}

async function doSearch() {
  if (!query.value?.trim()) return;
  try {
    setStatus("Searching…", 0);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query.value
    )}.json?proximity=ip&access_token=${token}`;
    const res = await fetch(url);
    const data = await res.json();
    const feat = data.features?.[0];
    if (feat) {
      map.flyTo({ center: feat.center, zoom: 13 });
      setStatus(`Moved to ${feat.text || "result"}`);
    } else {
      setStatus("No results");
    }
  } catch (e) {
    console.error(e);
    setStatus("Search failed");
  }
}

async function routeToSelected() {
  if (!selected.value) return;
  if (!navigator.geolocation) {
    setStatus("Geolocation not supported in this browser");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    try {
      setStatus("Calculating route…", 0);
      const start = [pos.coords.longitude, pos.coords.latitude];
      const end = [selected.value.lng, selected.value.lat];
      const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start.join(",")};${end.join(
        ","
      )}?geometries=geojson&access_token=${token}`;
      const res = await fetch(url);
      const data = await res.json();
      const line = data.routes?.[0]?.geometry;
      if (!line) {
        setStatus("No route found");
        return;
      }
      // Remove previous route if present
      if (map.getLayer("route")) {
        map.removeLayer("route");
        map.removeSource("route");
      }
      map.addSource("route", { type: "geojson", data: { type: "Feature", geometry: line } });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        paint: { "line-width": 5 }
      });

      // fit bounds
      map.fitBounds([start, end], { padding: 60 });
      setStatus("Route displayed");
    } catch (e) {
      console.error(e);
      setStatus("Routing failed");
    }
  }, () => setStatus("Location permission denied"));
}

onMounted(() => {
  map = new mapboxgl.Map({
    container: mapRef.value,
    style: "mapbox://styles/mapbox/streets-v12",
    center: [144.9631, -37.8136], // Melbourne
    zoom: 10,
    accessToken: token
  });
  map.on("load", addProgramMarkers);
});

onBeforeUnmount(() => {
  clearMarkers();
  if (map) map.remove();
});

watch(() => props.programs, () => {
  if (map?.loaded()) addProgramMarkers();
}, { deep: true });

/* util */
function escapeHtml(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
</script>

<style scoped>
.marker:focus {
  outline: 3px solid #ffc107; /* visible focus ring for a11y */
}
</style>
