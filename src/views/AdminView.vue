<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Admin • Dashboard & User Directory</h3>
      <div class="d-flex gap-2">
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/profile">Profile</RouterLink>
      </div>
    </div>

    <!-- Alerts -->
    <div v-if="loading" class="alert alert-info py-2 mb-3">Loading data…</div>
    <div v-if="error" class="alert alert-danger py-2 mb-3">
      {{ error }} — Check Firestore rules or your admin role.
    </div>

    <!-- KPI Cards -->
    <div class="row g-3 mb-4" v-if="!loading">
      <div class="col-6 col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted mb-1">Users</h6>
            <div class="display-6">{{ stats.users }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted mb-1">Programs</h6>
            <div class="display-6">{{ stats.programs }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted mb-1">Reviews</h6>
            <div class="display-6">{{ stats.reviews }}</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="card text-center shadow-sm">
          <div class="card-body">
            <h6 class="text-muted mb-1">Avg Rating</h6>
            <div class="display-6">{{ stats.avgRating.toFixed(1) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart -->
    <div class="card shadow-sm mb-4" v-if="!loading">
      <div class="card-header bg-light">
        <strong>Program Capacity</strong>
      </div>
      <div class="card-body">
        <canvas id="capacityChart" height="110" aria-label="Program capacity bar chart" role="img"></canvas>
        <small class="text-muted d-block mt-2">Shows capacity configured for each program.</small>
      </div>
    </div>

    <!-- User Directory (kept from your original) -->
    <div class="card shadow-sm">
      <div class="card-header bg-dark text-white">
        <strong>User Directory</strong>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-striped table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Username</th><th>Email</th><th>Role</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.username || '(no username)' }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <span class="badge" :class="u.role === 'admin' ? 'bg-primary' : 'bg-secondary'">
                    {{ u.role || 'member' }}
                  </span>
                </td>
                <td>{{ formatDate(u.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!loading && users.length === 0" class="text-muted mt-2">No users found.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import Chart from "chart.js/auto";

const users = ref([]);
const programs = ref([]);
const loading = ref(true);
const error = ref("");

const stats = ref({
  users: 0,
  programs: 0,
  reviews: 0,
  avgRating: 0,
});

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const opts = { year: "numeric", month: "short", day: "numeric" };
  return d.toLocaleDateString(undefined, opts);
}

onMounted(async () => {
  try {
    // Load users
    const userSnap = await getDocs(collection(db, "users"));
    users.value = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    stats.value.users = users.value.length;

    // Load programs
    const progSnap = await getDocs(collection(db, "programs"));
    programs.value = progSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    stats.value.programs = programs.value.length;

    // Optional: derive reviews + avg rating if you use ratings/{itemKey}/reviews/{uid}
    // If you don't have nested reviews yet, these stay 0 gracefully.
    let allReviews = [];
    try {
      // If you store an itemKey on each program, fetch nested reviews
      for (const p of programs.value) {
        if (p.itemKey) {
          const subSnap = await getDocs(collection(db, `ratings/${p.itemKey}/reviews`));
          allReviews = allReviews.concat(subSnap.docs.map(r => r.data()));
        }
      }
    } catch (e) {
      // keep silent; not all setups have nested reviews yet
      // console.debug("reviews fetch skipped:", e.message);
    }
    stats.value.reviews = allReviews.length || 0;
    stats.value.avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + (Number(r.score) || 0), 0) / allReviews.length
        : 0;

    // Chart.js: Program capacities
    const ctx = document.getElementById("capacityChart");
    if (ctx && programs.value.length) {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: programs.value.map(p => p.title),
          datasets: [
            {
              label: "Capacity",
              data: programs.value.map(p => Number(p.capacity) || 0),
              // Chart.js will auto-pick colors; keeping it simple for accessibility
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: true },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Capacity" } },
            x: { title: { display: true, text: "Program" } },
          },
        },
      });
    }
  } catch (e) {
    error.value = e.message || "Failed to load admin data.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.card { border-radius: 12px; }
</style>
