<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">Admin • Programs</h3>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="exportProgramsCsv">
          Export CSV
        </button>
        <button class="btn btn-primary btn-sm" @click="openCreate">+ New Program</button>
        <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">Dashboard</RouterLink>
      </div>
    </div>

    <div class="row g-2 mb-3">
      <div class="col-12 col-md-4">
        <input v-model="q" class="form-control" placeholder="Search (title, type, suburb, days)" aria-label="Search programs">
      </div>
      <div class="col-6 col-md-2">
        <label class="visually-hidden" for="pageSizeSel">Page size</label>
        <select id="pageSizeSel" v-model="pageSize" class="form-select">
          <option :value="10">10 / page</option>
          <option :value="25">25 / page</option>
          <option :value="50">50 / page</option>
        </select>
      </div>
      <div class="col-6 col-md-2">
        <label class="visually-hidden" for="activeSel">Filter active</label>
        <select id="activeSel" v-model="onlyActive" class="form-select">
          <option :value="false">All</option>
          <option :value="true">Active only</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="alert alert-info py-2">Loading programs…</div>
    <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

    <div class="table-responsive" v-if="!loading">
      <table class="table table-striped table-hover align-middle">
        <thead>
          <tr>
            <th @click="sortBy('title')" role="button" aria-label="Sort by title">
              Title <SortIcon :col="'title'" :sort="sort" />
            </th>
            <th @click="sortBy('type')" role="button" aria-label="Sort by type">
              Type <SortIcon :col="'type'" :sort="sort" />
            </th>
            <th>Days</th>
            <th @click="sortBy('suburb')" role="button" aria-label="Sort by suburb">
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
        <div class="btn-group" role="group" aria-label="Pagination">
          <button class="btn btn-outline-secondary btn-sm" :disabled="page===1" @click="page--">Prev</button>
          <span class="btn btn-outline-secondary btn-sm disabled">Page {{ page }} / {{ totalPages }}</span>
          <button class="btn btn-outline-secondary btn-sm" :disabled="page===totalPages" @click="page++">Next</button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div class="modal fade" ref="modalRef" tabindex="-1" aria-labelledby="programModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="save">
            <div class="modal-header">
              <h5 class="modal-title" id="programModalTitle">{{ editing?.id ? 'Edit Program' : 'New Program' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label" for="fTitle">Title</label>
                  <input id="fTitle" v-model.trim="form.title" class="form-control" required>
                </div>
                <div class="col-md-6">
                  <label class="form-label" for="fType">Type</label>
                  <input id="fType" v-model.trim="form.type" class="form-control" placeholder="soccer / yoga / basketball …" required>
                </div>
                <div class="col-md-12">
                  <label class="form-label" for="fDays">Days (comma separated)</label>
                  <input id="fDays" v-model="daysInput" class="form-control" placeholder="Mon, Wed, Fri">
                </div>
                <div class="col-md-8">
                  <label class="form-label" for="fAddress">Address</label>
                  <input id="fAddress" v-model.trim="form.address" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="fSuburb">Suburb</label>
                  <input id="fSuburb" v-model.trim="form.suburb" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="fLat">Latitude</label>
                  <input id="fLat" v-model.number="form.lat" type="number" step="any" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="fLng">Longitude</label>
                  <input id="fLng" v-model.number="form.lng" type="number" step="any" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="fCap">Capacity</label>
                  <input id="fCap" v-model.number="form.capacity" type="number" min="0" class="form-control">
                </div>
                <div class="col-md-4">
                  <label class="form-label" for="fActive">Active</label>
                  <select id="fActive" v-model="form.active" class="form-select">
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </div>
              </div>
              <div v-if="saveError" class="alert alert-danger mt-3">{{ saveError }}</div>
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
    <div class="modal fade" ref="deleteRef" tabindex="-1" aria-labelledby="delTitle" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title" id="delTitle">Delete Program</h5></div>
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

// ✅ SortIcon uses render fn (no runtime template compile)
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
const q = ref("");
const onlyActive = ref(false);
const page = ref(1);
const pageSize = ref(10);
const sort = reactive({ col: "title", dir: "asc" });

function normalize(s) { return String(s || "").toLowerCase(); }

const filtered = computed(() => {
  const term = normalize(q.value);
  const base = rows.value.filter(r => {
    if (onlyActive.value && !r.active) return false;
    if (!term) return true;
    const hay = `${r.title} ${r.type} ${r.suburb} ${(r.days || []).join(" ")}`.toLowerCase();
    return hay.includes(term);
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

/* ── Export CSV (E.4) ───────────────────────────────── */
function exportProgramsCsv() {
  const header = ["id","title","type","suburb","capacity","active","days"];
  const rowsToExport = filtered.value.map(r => ({
    id: r.id,
    title: r.title || "",
    type: r.type || "",
    suburb: r.suburb || "",
    capacity: r.capacity ?? "",
    active: r.active ? "true" : "false",
    days: (r.days || []).join("|"),
  }));
  downloadCsv(header, rowsToExport, "programs.csv");
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
</script>

<style scoped>
th[role="button"] { user-select: none; }
/* Helper class for skip/hidden labels if you use it elsewhere */
.visually-hidden { position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
</style>
