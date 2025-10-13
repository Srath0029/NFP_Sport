<template>
  <div class="container mt-4" id="main">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Admin • Users</h3>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="exportUsersCsv">
          Export CSV
        </button>
        <button
          class="btn btn-primary btn-sm"
          :disabled="selectedEmails.size === 0 || sending"
          @click="openBulkEmail"
        >
          Email Selected ({{ selectedEmails.size }})
        </button>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info py-2">Loading users…</div>
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

    <div class="table-responsive" v-if="!loading">
      <table
        id="usersTable"
        ref="tableRef"
        class="table table-striped table-hover align-middle"
        style="width: 100%"
        aria-label="Users directory"
      >
        <thead>
          <tr>
            <th style="width:48px;">
              <input
                class="form-check-input"
                type="checkbox"
                :checked="allChecked"
                @change="toggleAll($event)"
                aria-label="Select all users"
              />
            </th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>First Name</th>
            <th>Last Name</th>
          </tr>
          <!-- Per-column filters (DataTables will use these) -->
          <tr>
            <th></th>
            <th><input class="form-control form-control-sm" type="text" placeholder="Search email" /></th>
            <th><input class="form-control form-control-sm" type="text" placeholder="Search username" /></th>
            <th>
              <select class="form-select form-select-sm">
                <option value="">Any</option>
                <option value="admin">admin</option>
                <option value="member">member</option>
              </select>
            </th>
            <th><input class="form-control form-control-sm" type="text" placeholder="Search first name" /></th>
            <th><input class="form-control form-control-sm" type="text" placeholder="Search last name" /></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.email">
            <td>
              <input
                class="form-check-input"
                type="checkbox"
                :value="u.email"
                :checked="selectedEmails.has(u.email)"
                @change="toggleSelect($event, u.email)"
                :aria-label="`Select ${u.email}`"
              />
            </td>
            <td>{{ u.email }}</td>
            <td>{{ u.username || '(no username)' }}</td>
            <td><span class="badge" :class="u.role==='admin' ? 'bg-primary' : 'bg-secondary'">{{ u.role || 'member' }}</span></td>
            <td>{{ u.firstName || '' }}</td>
            <td>{{ u.lastName || '' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bulk Email Modal -->
    <div class="modal fade" ref="emailRef" tabindex="-1" aria-labelledby="bulkEmailTitle" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <form @submit.prevent="sendBulkEmail">
            <div class="modal-header">
              <h5 class="modal-title" id="bulkEmailTitle">Email Selected Users</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div class="modal-body">
              <div class="mb-2">
                <label class="form-label" for="subj">Subject</label>
                <input id="subj" v-model.trim="emailForm.subject" class="form-control" required />
              </div>
              <div>
                <label class="form-label" for="html">Message (HTML allowed)</label>
                <textarea id="html" v-model="emailForm.html" rows="6" class="form-control" required></textarea>
              </div>
              <div class="form-text mt-2">
                Sending to {{ selectedEmails.size }} recipient(s).
              </div>
              <div v-if="sendError" class="alert alert-danger mt-2">{{ sendError }}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="sending">
                {{ sending ? 'Sending…' : 'Send' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import DataTable from "datatables.net-bs5";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import * as bootstrap from "bootstrap";

const users = ref([]);
const loading = ref(true);
const error = ref("");

const tableRef = ref(null);
let dt; // DataTable instance

// Selection state
const selectedEmails = ref(new Set());
const allChecked = ref(false);

function toggleSelect(e, email) {
  if (e.target.checked) selectedEmails.value.add(email);
  else selectedEmails.value.delete(email);
  allChecked.value = selectedEmails.value.size === users.value.length && users.value.length > 0;
}
function toggleAll(e) {
  selectedEmails.value.clear();
  if (e.target.checked) {
    users.value.forEach(u => u.email && selectedEmails.value.add(u.email));
  }
  // reflect current checkbox state on visible rows (optional; DataTables may redraw)
  nextTick(() => {
    const inputs = tableRef.value?.querySelectorAll('tbody input[type="checkbox"]') || [];
    inputs.forEach(inp => (inp.checked = e.target.checked));
  });
  allChecked.value = e.target.checked;
}

// Bulk email modal
const emailRef = ref(null);
let emailModal;
const emailForm = ref({ subject: "", html: "<p>Hello team,</p><p>…</p>" });
const sending = ref(false);
const sendError = ref("");

function openBulkEmail() {
  sendError.value = "";
  emailForm.value.subject = "NFP Sport update";
  emailForm.value.html = "<p>Hello,</p><p>We have an update for you.</p>";
  emailModal?.show();
}

async function sendBulkEmail() {
  try {
    sending.value = true;
    sendError.value = "";
    const to = Array.from(selectedEmails.value);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        to,
        subject: emailForm.value.subject,
        html: emailForm.value.html
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      throw new Error(data?.detail || data?.error || "Send failed");
    }
    emailModal?.hide();
    alert(`Email queued to ${to.length} recipient(s).`);
  } catch (e) {
    sendError.value = e?.message || "Send failed.";
  } finally {
    sending.value = false;
  }
}

// CSV export
function exportUsersCsv() {
  const header = ["email","username","role","firstName","lastName"];
  const rows = users.value.map(u => ({
    email: u.email || "",
    username: u.username || "",
    role: u.role || "member",
    firstName: u.firstName || "",
    lastName: u.lastName || ""
  }));
  downloadCsv(header, rows, "users.csv");
}
function downloadCsv(header, objects, filename) {
  const line = arr => arr.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(",");
  const body = objects.map(o => line(header.map(h => o[h])));
  const csv  = [line(header), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, "users"));
    users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error(e);
    error.value = e?.message || "Failed to load users.";
  } finally {
    loading.value = false;
  }

  await nextTick();

  // init modal
  if (emailRef.value) emailModal = new bootstrap.Modal(emailRef.value);

  // DataTables init with per-column filters
  dt = new DataTable(tableRef.value, {
    pageLength: 10,
    ordering: true,
    searching: true,
    // First column (checkbox) not orderable/searchable
    columnDefs: [
      { targets: 0, orderable: false, searchable: false, width: "48px" }
    ]
  });

  // Hook per-column inputs in the 2nd header row
  dt.columns().every(function (idx) {
    const header = this.header();
    const filterRow = header.parentElement.nextElementSibling; // second <tr>
    if (!filterRow) return;

    const cell = filterRow.children[idx];
    if (!cell) return;

    const input = cell.querySelector("input");
    const select = cell.querySelector("select");

    if (input) {
      input.addEventListener("keyup", () => this.search(input.value).draw());
    }
    if (select) {
      select.addEventListener("change", () => this.search(select.value).draw());
    }
  });
});

onBeforeUnmount(() => {
  try { dt && dt.destroy(); } catch {}
});
</script>

<style scoped>
/* Keep header filter inputs neat */
thead tr:nth-child(2) th { background: #f8f9fa; }
thead tr:nth-child(2) input,
thead tr:nth-child(2) select { min-width: 140px; }
</style>
