<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/auth";

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const error = ref("");

async function submit() {
  error.value = "";
  try {
    // For Part C simplicity: login by email
    await login({ emailOrUsername: email.value, password: password.value });
    const redirect = route.query.redirect || "/profile";
    router.push(redirect);
  } catch (e) {
    error.value = e.message || "Invalid credentials";
  }
}
</script>

<template>
  <div class="container mt-5" style="max-width: 640px;">
    <div class="card p-4 shadow-sm">
      <h3 class="mb-3">Login</h3>
      <form @submit.prevent="submit">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model.trim="email" type="email" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" required />
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit">Sign In</button>
          <RouterLink class="btn btn-outline-secondary" to="/register">Create account</RouterLink>
        </div>
        <p class="text-danger mt-3" v-if="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>
