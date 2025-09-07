<template>
  <div class="card p-3 shadow-sm">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h5 class="mb-0">{{ title }}</h5>
      <div>
        <strong>{{ avg.toFixed(1) }}</strong> / 5
        <small class="text-muted">({{ count }} ratings)</small>
      </div>
    </div>

    <div class="d-flex align-items-center gap-2">
      <div>
        <button v-for="n in 5" :key="n"
          class="btn btn-sm"
          :class="n <= userScore ? 'btn-warning' : 'btn-outline-secondary'"
          @click="rate(n)"
          :disabled="!user">
          ★
        </button>
      </div>
      <small v-if="!user" class="text-muted">Login to rate</small>
      <small v-else class="text-muted">Your rating: {{ userScore || '—' }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useAuth } from "../composables/auth";

const props = defineProps({
  itemKey: { type: String, required: true },   // unique key for the thing being rated
  title:   { type: String, default: "Rate" }
});

const { currentUser } = useAuth();
const user = computed(() => currentUser.value);

const STORAGE_KEY = "ratings_v1";
function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
function saveAll(obj) { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }

const all = ref(loadAll());
const ratings = computed(() => all.value[props.itemKey]?.ratings || []);
const count = computed(() => ratings.value.length);
const avg = computed(() => {
  if (ratings.value.length === 0) return 0;
  const sum = ratings.value.reduce((acc, r) => acc + (r.score || 0), 0);
  return sum / ratings.value.length;
});
const userScore = computed(() => {
  if (!user.value) return 0;
  const found = ratings.value.find(r => r.userId === user.value.id);
  return found?.score || 0;
});

function rate(score) {
  if (!user.value) return;
  const map = loadAll();
  const entry = map[props.itemKey] || { ratings: [] };
  const idx = entry.ratings.findIndex(r => r.userId === user.value.id);
  if (idx >= 0) entry.ratings[idx].score = score;
  else entry.ratings.push({ userId: user.value.id, score, at: new Date().toISOString() });
  map[props.itemKey] = entry;
  saveAll(map);
  all.value = map; // refresh reactive
}
</script>
