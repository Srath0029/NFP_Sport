<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Admin • Interactive Tables (D.3)</h3>
      <div class="d-flex gap-2">
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/">Home</RouterLink>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">Admin</RouterLink>
      </div>
    </div>

    <!-- PROGRAMS TABLE -->
    <div class="card mb-4">
      <div class="card-header">
        <strong>Programs</strong>
        <small class="text-muted"> – sort, search (per column), 10 rows per page</small>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table id="programsTable" class="table table-striped table-hover" style="width:100%">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Suburb</th>
                <th>Days</th>
                <th>Capacity</th>
                <th>Active</th>
              </tr>
              <!-- per-column filters -->
              <tr class="filters">
                <th><input class="form-control form-control-sm" placeholder="Search title" /></th>
                <th><input class="form-control form-control-sm" placeholder="Search type" /></th>
                <th><input class="form-control form-control-sm" placeholder="Search suburb" /></th>
                <th><input class="form-control form-control-sm" placeholder="Tue, Thu…" /></th>
                <th><input class="form-control form-control-sm" placeholder="e.g. 20" /></th>
                <th>
                  <select class="form-select form-select-sm">
                    <option value="">All</option>
                    <option>true</option>
                    <option>false</option>
                  </select>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in programs" :key="p.id">
                <td>{{ p.title }}</td>
                <td>{{ p.type }}</td>
                <td>{{ p.suburb }}</td>
                <td>{{ (p.days || []).join(', ') }}</td>
                <td>{{ p.capacity ?? '—' }}</td>
                <td>{{ p.active ? 'true' : 'false' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- USERS TABLE -->
    <div class="card">
      <div class="card-header">
        <strong>Users</strong>
        <small class="text-muted"> – sort, search (per column), 10 rows per page</small>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table id="usersTable" class="table table-striped table-hover" style="width:100%">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
              <!-- per-column filters -->
              <tr class="filters">
                <th><input class="form-control form-control-sm" placeholder="Search username" /></th>
                <th><input class="form-control form-control-sm" placeholder="Search email" /></th>
                <th>
                  <select class="form-select form-select-sm">
                    <option value="">All</option>
                    <option>admin</option>
                    <option>member</option>
                  </select>
                </th>
                <th><input class="form-control form-control-sm" placeholder="YYYY-MM-DD" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.username || '(no username)' }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.role || 'member' }}</td>
                <td>{{ formatDate(u.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const programs = ref([]);
const users = ref([]);

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

let programsDT = null;
let usersDT = null;

onMounted(async () => {
  // 1) Load data from Firestore
  const pSnap = await getDocs(collection(db, "programs"));
  programs.value = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const uSnap = await getDocs(collection(db, "users"));
  users.value = uSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 2) Wait for DOM to render rows, then initialize DataTables
  queueMicrotask(() => {
    // Programs
    programsDT = window.$("#programsTable").DataTable({
      pageLength: 10,
      lengthChange: false,
      ordering: true,
      responsive: true,
    });
    // Per-column search (programs)
    programsDT.columns().every(function () {
      const that = this;
      const input = this.header().parentNode.querySelectorAll(".filters th")[this.index()]?.querySelector("input,select");
      if (input) {
        input.addEventListener("keyup", () => that.search(input.value).draw());
        input.addEventListener("change", () => that.search(input.value).draw());
      }
    });

    // Users
    usersDT = window.$("#usersTable").DataTable({
      pageLength: 10,
      lengthChange: false,
      ordering: true,
      responsive: true,
    });
    // Per-column search (users)
    usersDT.columns().every(function () {
      const that = this;
      const input = this.header().parentNode.querySelectorAll(".filters th")[this.index()]?.querySelector("input,select");
      if (input) {
        input.addEventListener("keyup", () => that.search(input.value).draw());
        input.addEventListener("change", () => that.search(input.value).draw());
      }
    });
  });
});

onBeforeUnmount(() => {
  if (programsDT) {
    programsDT.destroy(true);
    programsDT = null;
  }
  if (usersDT) {
    usersDT.destroy(true);
    usersDT = null;
  }
});
</script>

<style scoped>
/* Keep filter row visually subtle */
thead .filters th {
  background: #f8f9fa;
  border-bottom: 0;
}
thead .filters input,
thead .filters select {
  min-width: 140px;
}
</style>
