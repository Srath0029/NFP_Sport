<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">NFP Sport</RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/about">About</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/contact">Contact</RouterLink></li>
          <li class="nav-item" v-if="user"><RouterLink class="nav-link" to="/profile">Profile</RouterLink></li>

          <!-- Admin dropdown -->
          <li class="nav-item dropdown" v-if="isAdmin">
            <button
              class="nav-link dropdown-toggle btn btn-link"
              id="adminDropdown"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Admin
            </button>
            <ul class="dropdown-menu" aria-labelledby="adminDropdown">
              <li><RouterLink class="dropdown-item" to="/admin">Dashboard</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/admin/tables">Programs Table</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/admin/users">Users Table</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/admin/email">Email Panel</RouterLink></li>
            </ul>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto">
          <li v-if="!user" class="nav-item"><RouterLink class="nav-link" to="/login">Login</RouterLink></li>
          <li v-if="!user" class="nav-item"><RouterLink class="nav-link" to="/register">Register</RouterLink></li>

          <li v-else class="nav-item dropdown">
            <button class="nav-link dropdown-toggle btn btn-link" type="button" data-bs-toggle="dropdown">
              {{ user.username }} <span class="badge bg-secondary">{{ user.role }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><button class="dropdown-item" @click="doLogout">Logout</button></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "../composables/auth";

const router = useRouter();
const { currentUser, logout } = useAuth();

const user = computed(() => currentUser.value || null);
const isAdmin = computed(() => !!(currentUser.value && currentUser.value.role === "admin"));

function doLogout() {
  logout();
  router.push({ name: "Home" });
}
</script>

<style>
/* Keep navbar on top of anything weird */
.navbar { position: sticky; top: 0; z-index: 2000; }
</style>
