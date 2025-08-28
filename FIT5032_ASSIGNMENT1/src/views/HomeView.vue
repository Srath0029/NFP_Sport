<template>
  <div class="container mt-4">
    <Form
      :existingUsernames="users.map(u => (u.username || '').toLowerCase())"
      @formSubmitted="addUser"
    />

    <div class="mt-4">
      <Dashboard :users="users" @deleteUser="removeUser" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Form from "../components/Form.vue";
import Dashboard from "../components/Dashboard.vue";

const STORAGE_KEY = "users_v1";
const users = ref([]);

const stored = localStorage.getItem(STORAGE_KEY);
if (stored) {
  try { users.value = JSON.parse(stored) || []; } catch { users.value = []; }
}
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value));

const addUser = (user) => { users.value.push(user); persist(); };
const removeUser = (index) => { users.value.splice(index, 1); persist(); };
</script>
