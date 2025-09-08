<template>
  <div class="container mt-4">
    <h3 class="mb-3">Admin • User Management</h3>
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-dark">
          <tr>
            <th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select v-model="u.role" class="form-select form-select-sm" style="width: 140px;">
                <option>member</option>
                <option>admin</option>
              </select>
            </td>
            <td>{{ new Date(u.createdAt).toLocaleDateString() }}</td>
            <td>
              <button class="btn btn-sm btn-primary" @click="apply(u)">Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-muted">Default admin page for demo — username <strong>admin</strong>, password <strong>Admin123!</strong></p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from "../composables/auth";

const { getUsers, setRole } = useAuth();
const users = ref([]);

onMounted(() => {
  users.value = getUsers().map(u => ({ ...u })); // shallow copy for local edits
});

function apply(u) {
  setRole(u.id, u.role);
}
</script>
