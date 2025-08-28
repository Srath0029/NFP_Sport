<template>
  <div class="card p-4 shadow-sm">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h3 class="mb-0">Registered Users</h3>
      <input
        class="form-control"
        style="max-width: 320px"
        v-model="q"
        placeholder="Search by name, username, or email"
        aria-label="Search users"
      />
    </div>

    <template v-if="filtered.length > 0">
      <div class="table-responsive">
        <table class="table table-striped table-hover mt-1">
          <thead class="table-dark">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Username</th>
              <th scope="col">Email</th>
              <th scope="col">Age</th>
              <th scope="col">Location</th>
              <th scope="col">Gender</th>
              <th scope="col" style="min-width: 240px;">Reason</th>
              <th scope="col" style="width: 90px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filtered" :key="index">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.age }}</td>
              <td>{{ user.location }}</td>
              <td>{{ user.gender }}</td>
              <td class="text-truncate" style="max-width: 280px;" :title="user.reason">
                {{ user.reason }}
              </td>
              <td>
                <button class="btn btn-sm btn-danger" @click="confirmDelete(index)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
    <template v-else>
      <p class="mb-0">No users registered yet.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({ users: { type: Array, required: true } });
const emit = defineEmits(["deleteUser"]);
const q = ref("");

const filtered = computed(() => {
  const s = q.value.trim().toLowerCase();
  if (!s) return props.users;
  return props.users.filter(u => {
    const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    return (
      name.includes(s) ||
      (u.username || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s)
    );
  });
});

const confirmDelete = (index) => {
  if (confirm("Delete this entry?")) emit("deleteUser", index);
};
</script>
