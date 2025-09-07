<template>
  <div class="container mt-5" style="max-width: 720px;">
    <div class="card p-4 shadow-sm">
      <h3 class="mb-3">Create Account</h3>
      <form @submit.prevent="submit">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Username</label>
            <input v-model.trim="username" class="form-control" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Email</label>
            <input v-model.trim="email" type="email" class="form-control" required />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" class="form-control" required />
            <small class="text-muted">Min 8 chars incl. a number</small>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Confirm Password</label>
            <input v-model="confirm" type="password" class="form-control" required />
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit">Register</button>
          <RouterLink class="btn btn-outline-secondary" to="/login">I have an account</RouterLink>
        </div>

        <p class="text-danger mt-3" v-if="error">{{ error }}</p>
        <p class="text-success mt-3" v-if="success">{{ success }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/auth";

const router = useRouter();
const { register } = useAuth();

const username = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const success = ref("");

async function submit() {
  error.value = ""; success.value = "";
  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }
  if (password.value.length < 8 || !/\d/.test(password.value)) {
    error.value = "Password must be 8+ characters and include a number.";
    return;
  }
  try {
    await login({ emailOrUsername: email, password });
    success.value = "Registered! Redirecting…";
    setTimeout(() => router.push({ name: "Home" }), 700);
  } catch (e) {
    error.value = e.message || "Registration failed";
  }
}
</script>
