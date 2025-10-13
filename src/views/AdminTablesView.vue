<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Admin • Programs</h3>
      <div class="d-flex gap-2">
        <button class="btn btn-success btn-sm"
                @click="exportCsv"
                :disabled="filtered.length === 0"
                title="Export currently filtered rows to CSV">
          Export CSV
        </button>
        <button class="btn btn-primary btn-sm" @click="openCreate">+ New Program</button>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">Dashboard</RouterLink>
      </div>
    </div>

    <!-- Global + per-column filters -->
    <div class="row g-2 mb-2">
      <div class="col-12 col-lg-4">
        <label class="form-label visually-hidden" for="progSearch">Search all</label>
        <input id="progSearch" v-model="q" class="form-control" placeholder="Search all (title, type, suburb, days)">
      </div>
      <div class="col-6 col-lg-2">
        <label class="form-label visually-hidden" for="pageSizeSel">Page size</label>
        <select id="pageSizeSel" v-model="pageSize" class="form-select">
          <option :value="10">10 / page</option>
          <option :value="25">25 / page</option>
          <option :value="50">50 / page</option>
        </select>
      </div>
      <div class="col-6 col-lg-2">
        <label class="form-label visually-hidden" for="activeSel">Active filter</label>
        <select id="activeSel" v-model="onlyActive" class="form-select">
          <option :value="false">All</option>
          <option :value="true">Active only</option>
        </select>
      </div>
    </div>

    <!-- Per-column quick filters -->
    <div class="row g-2 mb-3">
      <div class="col-12 col-sm-6 col-lg-3">
        <label class="form-label visually-hidden" for="fTitle">Filter by title</label>
        <input id="fTitle" v-model="fTitle" class="form-control" placeholder="Filter: Title">
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <label class="form-label visually-hidden" for="fType">Filter by type</label>
        <input id="fType" v-model="fType" class="form-control" placeholder="Filter: Type (e.g., soccer)">
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <label class="form-label visually-hidden" for="fSuburb">Filter by suburb</label>
        <input id="fSuburb" v-model="fSuburb" class="form-control" placeholder="Filter: Suburb">
      </div>
      <div class="col-12 col-sm-6 col-lg-3">
        <label class="form-label visually-hidden" for="fDays">Filter by day</label>
        <input id="fDays" v-model="fDays" class="form-control" placeholder="Filter: Day (Mon/Tue/…)">
      </div>
    </div>

    <div v-if="loading" class="alert alert-info py-2">Loading programs…</div>
    <div v-if="error" class="alert alert-danger py-2" role="status" aria-live="polite">{{ error }}</div>

    <div class="table-responsive" v-if="!loading">
      <table class="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th @click="sortBy('title')" role="button" tabindex="0">
              Title <SortIcon :col="'title'" :sort="sort" />
            </th>
            <th @click="sortBy('type')" role="button" tabindex="0">
              Type <SortIcon :col="'type'" :sort="sort" />
            </th>
            <th>Days</th>
            <th @click="sortBy('suburb')" role="button" tabindex="0">
              Suburb <SortIcon :col="'suburb'" :sort="sort" />
            </th>
            <th class="text-end">Cap.</th>
            <th>Active</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in paged" :key="p.id">
            <td>{{ p.title }}</td>
            <td class="text-capitalize">{{ p.type }}</td>
            <td>
              <span v-for="d in p.days" :key="d" class="badge bg-light text-dark me-1">{{ d }}</span>
            </td>
            <td>{{ p.suburb }}</td>
            <td class="text-end">{{ p.capacity ?? '—' }}</td>
            <td>
              <span class="badge" :class="p.active ? 'bg-success' : 'bg-secondary'">
                {{ p.active ? 'Yes' : 'No' }}
              </span>
            </td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-primary me-1" @click="openEdit(p)">Edit</button>
              <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center">
        <div class="text-muted">Showing {{ startIdx + 1 }}–{{ endIdx }} of {{ filtered.length }}</div>
        <div class="btn-group">
          <button class="btn btn-outline-secondary btn-sm" :disabled="page===1" @click="page--">Prev</button>
          <span class="btn btn-outline-secondary btn-sm disabled">Page {{ page }} / {{ totalPages }}</span>
          <button class="btn btn-outline-secondary btn-sm" :disabled="page===totalPages" @click="page++">Next</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" ref="modalRef" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="save">
            <div class="modal-header">
              <h5 class="modal-title">{{ editing?.id ? 'Edit Program' : 'New Program' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="progTitle">Title</label>
                  <input id="progTitle" v-model.trim="form.title" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="progType">Type</label>
                  <input id="progType" v-model.trim="form.type" class="form-control" placeholder="soccer / yoga / basketball …" required>
                </div>
                <div class="col-md-12">
                  <label class="form-label" for="progDays">Days (comma separated)</label>
                  <input id="progDays" v-model="daysInput" class="form-control" placeholder="Mon, Wed, Fri">
                </div>
                <div class="col-md-8">
                  <label class="form-label" for="progAddress">Address</label>
                  <input id="progAddress" v-model.trim="form.address" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="progSuburb">Suburb</label>
                  <input id="progSuburb" v-model.trim="form.suburb" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="progLat">Latitude</label>
                  <input id="progLat" v-model.number="form.lat" type="number" step="any" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="progLng">Longitude</label>
                  <input id="progLng" v-model.number="form.lng" type="number" step="any" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="progCap">Capacity</label>
                  <input id="progCap" v-model.number="form.capacity" type="number" min="0" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="progActive">Active</label>
                  <select id="progActive" v-model="form.active" class="form-select">
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </div>
              </div>
              <div v-if="saveError" class="alert alert-danger mt-3" role="status" aria-live="polite">{{ saveError }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-primary" type="submit" :disabled="saving">
                {{ saving ? 'Saving…' : 'Save' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div class="modal fade" ref="deleteRef" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Delete Program</h5></div>
          <div class="modal-body">
            Are you sure you want to delete <strong>{{ toDelete?.title }}</strong>?
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button class="btn btn-danger" @click="doDelete" :disabled="deleting">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, h } from "vue";
import * as bootstrap from "bootstrap";
import { listPrograms, createProgram, updateProgram, deleteProgramById } from "../services/programsService";

/* Sort icon as render function (no template compilation) */
const SortIcon = {
  props: { col: String, sort: Object },
  setup(props) {
    return () => {
      if (props.sort.col !== props.col) return null;
      const klass = props.sort.dir === "asc" ? "bi bi-caret-up-fill" : "bi bi-caret-down-fill";
      return h("span", { class: "ms-1" }, [h("i", { class: klass })]);
    };
  },
};

const rows = ref([]);
const loading = ref(true);
const error = ref("");

// filters / pagination / sorting
const q = ref("");          // global
const fTitle = ref("");     // per-column
const fType = ref("");
const fSuburb = ref("");
const fDays = ref("");

const onlyActive = ref(false);
const page = ref(1);
const pageSize = ref(10);
const sort = reactive({ col: "title", dir: "asc" });

function normalize(s) { return String(s || "").toLowerCase().trim(); }

const filtered = computed(() => {
  const global = normalize(q.value);
  const ft = normalize(fTitle.value);
  const fty = normalize(fType.value);
  const fs = normalize(fSuburb.value);
  const fd = normalize(fDays.value);

  const base = rows.value.filter(r => {
    if (onlyActive.value && !r.active) return false;

    // global match (in any)
    if (global) {
      const hay = `${r.title} ${r.type} ${r.suburb} ${(r.days || []).join(" ")}`.toLowerCase();
      if (!hay.includes(global)) return false;
    }

    // per-column AND filters
    if (ft && !normalize(r.title).includes(ft)) return false;
    if (fty && !normalize(r.type).includes(fty)) return false;
    if (fs && !normalize(r.suburb).includes(fs)) return false;
    if (fd) {
      const dset = (r.days || []).map(d => normalize(d));
      const match = dset.some(d => d.includes(fd));
      if (!match) return false;
    }
    return true;
  });

  const sorted = [...base].sort((a, b) => {
    const av = (a[sort.col] ?? "").toString().toLowerCase();
    const bv = (b[sort.col] ?? "").toString().toLowerCase();
    if (av < bv) return sort.dir === "asc" ? -1 : 1;
    if (av > bv) return sort.dir === "asc" ? 1 : -1;
    return 0;
  });

  if ((page.value - 1) * pageSize.value >= sorted.length) page.value = 1;
  return sorted;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));
const startIdx   = computed(() => (page.value - 1) * pageSize.value);
const endIdx     = computed(() => Math.min(filtered.value.length, startIdx.value + pageSize.value));
const paged      = computed(() => filtered.value.slice(startIdx.value, endIdx.value));

function sortBy(col) {
  if (sort.col === col) sort.dir = sort.dir === "asc" ? "desc" : "asc";
  else { sort.col = col; sort.dir = "asc"; }
}

onMounted(async () => {
  try {
    rows.value = await listPrograms();
  } catch (e) {
    console.error(e);
    error.value = e?.message || "Failed to load programs.";
  } finally {
    loading.value = false;
  }
});

// ── Modals ──────────────────────────────────────────────
const modalRef  = ref(null);
const deleteRef = ref(null);
let formModal;
let deleteModal;

onMounted(async () => {
  await nextTick();
  if (modalRef.value)  formModal   = new bootstrap.Modal(modalRef.value);
  if (deleteRef.value) deleteModal = new bootstrap.Modal(deleteRef.value);
});

// form state
const editing = ref(null);
const form = reactive({
  title: "", type: "", days: [], address: "", suburb: "",
  lat: null, lng: null, capacity: null, active: true,
});
const saveError = ref("");
const saving = ref(false);
const toDelete = ref(null);
const deleting = ref(false);

// days input helpers
const daysInput = computed({
  get() { return (form.days || []).join(", "); },
  set(v) {
    form.days = String(v || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);
  }
});

function openCreate() {
  editing.value = null;
  Object.assign(form, {
    title: "", type: "", days: [], address: "", suburb: "",
    lat: null, lng: null, capacity: null, active: true,
  });
  saveError.value = "";
  formModal?.show();
}

function openEdit(p) {
  editing.value = p;
  Object.assign(form, JSON.parse(JSON.stringify(p)));
  saveError.value = "";
  formModal?.show();
}

async function save() {
  try {
    saving.value = true;
    saveError.value = "";
    if (editing.value?.id) {
      await updateProgram(editing.value.id, { ...form });
      const idx = rows.value.findIndex(r => r.id === editing.value.id);
      if (idx >= 0) rows.value[idx] = { ...rows.value[idx], ...form };
    } else {
      const created = await createProgram({ ...form });
      rows.value.unshift({ id: created.id, ...form });
    }
    formModal?.hide();
  } catch (e) {
    console.error(e);
    saveError.value = e?.message || "Save failed.";
  } finally {
    saving.value = false;
  }
}

function confirmDelete(p) {
  toDelete.value = p;
  deleteModal?.show();
}

async function doDelete() {
  try {
    deleting.value = true;
    await deleteProgramById(toDelete.value.id);
    rows.value = rows.value.filter(r => r.id !== toDelete.value.id);
    deleteModal?.hide();
  } catch (e) {
    console.error(e);
    alert(e?.message || "Delete failed.");
  } finally {
    deleting.value = false;
  }
}

/* ── CSV Export (exports the *filtered* data set) ───────────────────────────── */
function csvEscape(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(rows, headers) {
  const head = headers.map(h => csvEscape(h.label)).join(",");
  const body = rows.map(r =>
    headers.map(h => {
      const val = h.key === "days" ? (r.days || []).join("; ")
        : h.key === "active" ? (r.active ? "Yes" : "No")
        : r[h.key];
      return csvEscape(val);
    }).join(",")
  ).join("\n");
  return head + "\n" + body + "\n";
}
function download(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function exportCsv() {
  const headers = [
    { key: "title",    label: "Title" },
    { key: "type",     label: "Type" },
    { key: "days",     label: "Days" },
    { key: "suburb",   label: "Suburb" },
    { key: "address",  label: "Address" },
    { key: "lat",      label: "Latitude" },
    { key: "lng",      label: "Longitude" },
    { key: "capacity", label: "Capacity" },
    { key: "active",   label: "Active" },
  ];
  const csv = toCsv(filtered.value, headers);
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
  download(`programs-${stamp}.csv`, csv);
}
</script>

<style scoped>
th[role="button"] { user-select: none; }
</style>
