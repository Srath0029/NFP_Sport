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

const addUser = (user) => {
  users.value.push(user);
  localStorage.setItem("users", JSON.stringify(users.value));
};

const removeUser = (index) => {
  users.value.splice(index, 1);
  localStorage.setItem("users", JSON.stringify(users.value));
};

const storedUsers = localStorage.getItem("users");
if (storedUsers) {
  users.value = JSON.parse(storedUsers);
}
</script>
