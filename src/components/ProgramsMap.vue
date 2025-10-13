<template>
  <div class="card shadow-sm">
    <div class="card-header bg-light d-flex justify-content-between align-items-center">
      <strong>Programs Map</strong>
      <div class="d-flex gap-2 align-items-center">
        <small class="text-muted me-2">Points: {{ featureCount }}</small>
        <button class="btn btn-sm btn-outline-primary" @click="locateMe" :disabled="geoBusy">
          {{ geoBusy ? 'Locating…' : 'Find near me' }}
        </button>
        <button class="btn btn-sm btn-outline-secondary" @click="fitAll" :disabled="!hasAnyFeature">
          Fit all
        </button>
      </div>
    </div>
    <div class="card-body p-0">
      <div ref="mapEl" class="map-container" role="region" aria-label="Programs map"></div>
    </div>
  </div>
</template>

<script setup>
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps({
  // expects [{ id,title,lat,lng,address,suburb,capacity,active }]
  programs: { type: Array, default: () => [] },
});

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

const mapEl = ref(null);
let map;
let resizeObs;

// --- GeoJSON state ----------------------------------------------------
const fc = ref({ type: "FeatureCollection", features: [] });
const featureCount = computed(() => fc.value.features?.length || 0);
const hasAnyFeature = computed(() => featureCount.value > 0);

function toFeature(p) {
  const { lat, lng } = p;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (p.active === false) return null;
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [lng, lat] },
    properties: {
      id: p.id || "",
      title: String(p.title || "Program"),
      address: [p.address, p.suburb].filter(Boolean).join(", "),
      lat, lng,
    },
  };
}

function rebuildFC() {
  const feats = (props.programs || []).map(toFeature).filter(Boolean);
  fc.value = { type: "FeatureCollection", features: feats };
  // Push to map if the source exists
  if (map && map.getSource("programs")) {
    map.getSource("programs").setData(fc.value);
  }
  console.log("[ProgramsMap] features now:", feats.length);
}

function fitAll() {
  if (!map || !hasAnyFeature.value) return;
  const b = new mapboxgl.LngLatBounds();
  fc.value.features.forEach(f => b.extend(f.geometry.coordinates));
  map.fitBounds(b, { padding: 50, duration: 400 });
}

function showPopup(f) {
  if (!f) return;
  const { title, address, lat, lng } = f.properties || {};
  const gq = encodeURIComponent(`${lat},${lng}`);
  const html = `
    <div style="min-width:220px">
      <strong>${title || "Program"}</strong>
      <div class="text-muted small">${address || ""}</div>
      <div class="mt-2 d-flex gap-1">
        <a class="btn btn-sm btn-primary" target="_blank" rel="noopener"
           href="https://www.google.com/maps/dir/?api=1&destination=${gq}&travelmode=walking">Google</a>
        <a class="btn btn-sm btn-outline-secondary" target="_blank" rel="noopener"
           href="https://maps.apple.com/?daddr=${gq}&dirflg=w">Apple</a>
      </div>
    </div>`;
  new mapboxgl.Popup({ offset: 16 })
    .setLngLat([lng, lat])
    .setHTML(html)
    .addTo(map);
}

const geoBusy = ref(false);
function locateMe() {
  if (!navigator.geolocation || !map) return;
  geoBusy.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      map.flyTo({ center: [longitude, latitude], zoom: 13, essential: true });
      new mapboxgl.Marker({ color: "#0d6efd" })
        .setLngLat([longitude, latitude])
        .setPopup(new mapboxgl.Popup({ offset: 14 }).setText("You are here"))
        .addTo(map);
      geoBusy.value = false;
    },
    () => (geoBusy.value = false),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// --- Map lifecycle ----------------------------------------------------
onMounted(async () => {
  await nextTick();

  map = new mapboxgl.Map({
    container: mapEl.value,
    style: "mapbox://styles/mapbox/streets-v12",
    center: [144.9631, -37.8136],
    zoom: 10,
    attributionControl: true,
  });

  map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl,
    marker: false,
    flyTo: { zoom: 14 },
    placeholder: "Search places…",
  });
  map.addControl(geocoder, "top-left");
  geocoder.on("result", (e) => {
    const c = e.result?.center;
    if (Array.isArray(c)) map.flyTo({ center: c, zoom: 14 });
  });

  map.on("load", () => {
    // Add source + layer
    map.addSource("programs", { type: "geojson", data: fc.value });
    map.addLayer({
      id: "programs-circles",
      type: "circle",
      source: "programs",
      paint: {
        "circle-radius": 7,
        "circle-color": "#dc3545",
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    });

    map.on("click", "programs-circles", (e) => showPopup(e.features?.[0]));
    map.on("mouseenter", "programs-circles", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "programs-circles", () => (map.getCanvas().style.cursor = ""));

    rebuildFC();     // push initial data
    if (hasAnyFeature.value) fitAll();
  });

  // keep map crisp when container size changes
  if (window.ResizeObserver) {
    resizeObs = new ResizeObserver(() => map && map.resize());
    resizeObs.observe(mapEl.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObs && mapEl.value) resizeObs.unobserve(mapEl.value);
  map?.remove();
});

// Rebuild when programs prop changes
watch(
  () => props.programs,
  () => {
    rebuildFC();
    // auto-fit when new data flows in
    if (map?.loaded() && hasAnyFeature.value) fitAll();
  },
  { deep: true }
);
</script>

<style scoped>
.map-container { height: 520px; width: 100%; }
</style>
