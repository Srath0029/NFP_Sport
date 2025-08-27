<template>
  <div id="app">
    <NavBar />
    <div class="container mt-4">
      <Form @formSubmitted="addUser" />
      <Dashboard :users="users" @deleteUser="removeUser" />
      <!-- About Section -->
<div id="about" class="container mt-5">
  <h2>About</h2>
  <p>
    This non-profit web application promotes community health and wellbeing
    through sport. It helps members register, connect, and share resources.
  </p>
</div>

<!-- Contact Section -->
<div id="contact" class="container mt-5">
  <h2>Contact Us</h2>
  <p>
    Have questions? Reach out at <strong>info@nfp-example.org</strong> or visit
    us in Melbourne.
  </p>
</div>
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
