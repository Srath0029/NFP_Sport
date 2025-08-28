<template>
  <div class="container mt-5" style="max-width: 640px;">
    <div class="card p-4 shadow-sm">
      <h3 class="mb-3">Login</h3>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="mb-3">
          <label for="loginEmail" class="form-label">Email</label>
          <input id="loginEmail" type="email" v-model.trim="email" class="form-control" required />
        </div>

        <div class="mb-3">
          <label for="loginPassword" class="form-label">Password</label>
          <input id="loginPassword" type="password" v-model="password" class="form-control" required />
        </div>

        <button type="submit" class="btn btn-primary">Sign In</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const email = ref("");
const password = ref("");

const handleLogin = () => {
  // Placeholder for now (BR C will introduce real auth later)
  alert("Login submitted (placeholder).");
};
</script>
