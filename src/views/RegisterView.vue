<template>
  <div class="container mt-5" style="max-width: 720px;">
    <div class="card p-4 shadow-sm">
      <h3 class="mb-3">Create Account</h3>

      <form @submit.prevent="submit" novalidate>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Username</label>
            <input
              v-model.trim="username"
              class="form-control"
              :class="{ 'is-invalid': touched.username && !!errors.username }"
              @input="validate('username')"
              @blur="touch('username')"
              required
              autocomplete="username"
            />
            <div class="invalid-feedback" v-if="touched.username && errors.username">{{ errors.username }}</div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Email</label>
            <input
              v-model.trim="email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': touched.email && !!errors.email }"
              @input="validate('email')"
              @blur="touch('email')"
              required
              autocomplete="email"
            />
            <div class="invalid-feedback" v-if="touched.email && errors.email">{{ errors.email }}</div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': touched.password && !!errors.password }"
              @input="validate('password'); validate('confirm')"
              @blur="touch('password')"
              required
              autocomplete="new-password"
              placeholder="Min 8 chars incl. a number"
            />
            <div class="invalid-feedback" v-if="touched.password && errors.password">{{ errors.password }}</div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Confirm Password</label>
            <input
              v-model="confirm"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': touched.confirm && !!errors.confirm }"
              @input="validate('confirm')"
              @blur="touch('confirm')"
              required
              autocomplete="new-password"
            />
            <div class="invalid-feedback" v-if="touched.confirm && errors.confirm">{{ errors.confirm }}</div>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" type="submit" :disabled="loading">
            {{ loading ? 'Registering…' : 'Register' }}
          </button>
          <RouterLink class="btn btn-outline-secondary" to="/login">I have an account</RouterLink>
        </div>

        <p class="text-success mt-3" v-if="success">{{ success }}</p>
        <p class="text-danger mt-3" v-if="error">{{ error }}</p>
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

const loading = ref(false);
const error = ref("");
const success = ref("");

const errors = ref({ username: "", email: "", password: "", confirm: "" });
const touched = ref({ username: false, email: false, password: false, confirm: false });

function touch(f) { touched.value[f] = true; }
function validate(f) {
  switch (f) {
    case "username":
      errors.value.username = !username.value || username.value.length < 3
        ? "Username must be at least 3 characters." : "";
      break;
    case "email":
      errors.value.email = !email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
        ? "Enter a valid email address." : "";
      break;
    case "password":
      errors.value.password = !password.value || password.value.length < 8 || !/\d/.test(password.value)
        ? "Password must be 8+ characters and include a number." : "";
      break;
    case "confirm":
      errors.value.confirm = (confirm.value !== password.value)
        ? "Passwords do not match." : "";
      break;
  }
}
function validateAll() {
  Object.keys(touched.value).forEach(k => { touched.value[k] = true; validate(k); });
  return Object.values(errors.value).every(v => !v);
}

async function submit() {
  error.value = ""; success.value = "";
  if (!validateAll()) return;
  loading.value = true;
  try {
    await register({ email: email.value, password: password.value, username: username.value });
    router.push({ name: "Profile" }); // go complete profile
  } catch (e) {
    error.value = e?.message || "Registration failed.";
  } finally {
    loading.value = false;
  }
}
</script>
