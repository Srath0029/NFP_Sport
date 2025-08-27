<template>
  <div id="app">
    <NavBar />
    <div class="container mt-4">
      <Form @formSubmitted="addUser" />
      <Dashboard :users="users" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import NavBar from "./components/NavBar.vue";
import Form from "./components/Form.vue";
import Dashboard from "./components/Dashboard.vue";

// State to hold dynamic data
const users = ref([]);

// Add user from form submission
const addUser = (user) => {
  users.value.push({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    age: user.age,
  });
  // Save to LocalStorage (persistence beyond session)
  localStorage.setItem("users", JSON.stringify(users.value));
};

// Load existing users if any
const storedUsers = localStorage.getItem("users");
if (storedUsers) {
  users.value = JSON.parse(storedUsers);
}
</script>
