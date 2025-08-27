<template>
  <div id="app">
    <NavBar />
    <div class="container mt-4">
      <Form @formSubmitted="addUser" />
      <Dashboard :users="users" @deleteUser="removeUser" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "./components/NavBar.vue";
import Form from "./components/Form.vue";
import Dashboard from "./components/Dashboard.vue";

const users = ref([]);

// Add user and persist
const addUser = (user) => {
  users.value.push(user);
  localStorage.setItem("users", JSON.stringify(users.value));
};

// Delete user and persist
const removeUser = (index) => {
  users.value.splice(index, 1);
  localStorage.setItem("users", JSON.stringify(users.value));
};

// Load from localStorage on boot
const stored = localStorage.getItem("users");
if (stored) {
  try {
    users.value = JSON.parse(stored);
  } catch {
    users.value = [];
  }
}
</script>
