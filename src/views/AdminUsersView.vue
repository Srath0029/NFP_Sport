<!-- src/views/AdminUsersView.vue -->
<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h1 class="mb-0">Users Table</h1>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary btn-sm" @click="exportCsv">Export CSV</button>
      </div>
    </div>

    <table id="usersTable" class="table table-striped table-bordered" style="width:100%">
      <thead>
        <tr>
          <th>Email</th>
          <th>Username</th>
          <th>Role</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id || user.email">
          <td>{{ user.email }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.role || 'member' }}</td>
          <td>{{ user.firstName }}</td>
          <td>{{ user.lastName }}</td>
          <td>{{ user.createdAt ? formatDate(user.createdAt) : '—' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import DataTable from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";

const users = ref([]);

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso || "—"; }
}

onMounted(async () => {
  const snapshot = await getDocs(collection(db, "users"));
  users.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  // wait for DOM to paint
  setTimeout(() => {
    new DataTable("#usersTable", {
      pageLength: 10,
      searching: true,
      ordering: true,
      responsive: true,
    });
  }, 0);
});

/* ---------- CSV Export ---------- */
function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  // escape quotes and wrap if needed
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function toCsv(rows, headers) {
  const head = headers.map(h => csvEscape(h.label)).join(",");
  const body = rows.map(r =>
    headers.map(h => csvEscape(r[h.key])).join(",")
  ).join("\n");
  return head + "\n" + body + "\n";
}
function download(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportCsv() {
  const headers = [
    { key: "email",     label: "Email" },
    { key: "username",  label: "Username" },
    { key: "role",      label: "Role" },
    { key: "firstName", label: "First Name" },
    { key: "lastName",  label: "Last Name" },
    { key: "createdAt", label: "Created" },
  ];
  const csv = toCsv(users.value, headers);
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  download(`users-${stamp}.csv`, csv);
}
</script>
