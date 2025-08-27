<template>
  <div id="app">
    <NavBar />

    <div class="container mt-4">
      <!-- Form -->
      <Form
        :existingUsernames="users.map(u => (u.username || '').toLowerCase())"
        @formSubmitted="addUser"
      />

      <!-- Dashboard -->
      <div id="dashboard" class="mt-4">
        <Dashboard
          :users="users"
          @deleteUser="removeUser"
        />
      </div>
    </div>

    <!-- Simple About/Contact sections for navbar anchors -->
    <div id="about" class="container mt-5">
      <h2>About</h2>
      <p class="mb-0">
        This not-for-profit web application promotes health and wellbeing through community sport.
        Members can register, connect, and discover opportunities to get active.
      </p>
    </div>

    <div id="contact" class="container mt-5 mb-5">
      <h2>Contact Us</h2>
      <p class="mb-1">Email: <strong>info@nfp-example.org</strong></p>
      <p class="mb-0">Location: Melbourne, VIC</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "./components/NavBar.vue";
import Form from "./components/Form.vue";
import Dashboard from "./components/Dashboard.vue";

const STORAGE_KEY = "users_v1";
const users = ref([]);

// Load from localStorage on boot (safe parse)
const stored = localStorage.getItem(STORAGE_KEY);
if (stored) {
  try {
    users.value = JSON.parse(stored) || [];
  } catch {
    users.value = [];
  }
}

const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value));

// Add user and persist
const addUser = (user) => {
  users.value.push(user);
  persist();
};

// Delete user (with index) and persist
const removeUser = (index) => {
  users.value.splice(index, 1);
  persist();
};
</script>
