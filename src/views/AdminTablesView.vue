<template>
  <div class="container py-4">
    <h1 class="mb-4">Admin Tables</h1>

    <!-- 🧭 Programs Table -->
    <div class="card mb-5 shadow-sm">
      <div class="card-header bg-primary text-white">Programs</div>
      <div class="card-body">
        <table id="programsTable" class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Days</th>
              <th>Suburb</th>
              <th>Capacity</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in programs" :key="i">
              <td>{{ p.title }}</td>
              <td>{{ p.type }}</td>
              <td>{{ p.days.join(', ') }}</td>
              <td>{{ p.suburb }}</td>
              <td>{{ p.capacity }}</td>
              <td>{{ p.active ? '✅' : '❌' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 👥 Users Table -->
    <div class="card shadow-sm">
      <div class="card-header bg-success text-white">Users</div>
      <div class="card-body">
        <table id="usersTable" class="table table-striped table-bordered">
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in users" :key="i">
              <td>{{ u.email }}</td>
              <td>{{ u.username }}</td>
              <td>{{ u.role }}</td>
              <td>{{ new Date(u.createdAt).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import $ from "jquery";

const programs = ref([]);
const users = ref([]);

// Fetch data from Firestore
async function loadData() {
  const progSnap = await getDocs(collection(db, "programs"));
  programs.value = progSnap.docs.map(d => d.data());

  const userSnap = await getDocs(collection(db, "users"));
  users.value = userSnap.docs.map(d => d.data());
}

// Initialize DataTables
async function initTables() {
  await nextTick();
  $("#programsTable").DataTable({
    pageLength: 10,
    dom: 'lrtip', // hides default search bar
  });
  $("#usersTable").DataTable({
    pageLength: 10,
    dom: 'lrtip',
  });
}

onMounted(async () => {
  await loadData();
  await initTables();
});
</script>
