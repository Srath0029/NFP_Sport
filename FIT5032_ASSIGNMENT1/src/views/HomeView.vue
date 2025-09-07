<template>
  <div class="container mt-4">
    <!-- Rating block -->
    <div class="mb-4">
      <RatingWidget itemKey="overall_website_experience" title="Rate your experience with the website" />
    </div>

    <!-- Your existing Form + Dashboard -->
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
import RatingWidget from "../components/RatingWidget.vue";

const STORAGE_KEY = "users_v1";
const users = ref([]);
try { users.value = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { users.value = []; }
const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value));
const addUser = (u) => { users.value.push(u); persist(); };
const removeUser = (i) => { users.value.splice(i, 1); persist(); };
</script>
