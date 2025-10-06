<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">NFP Sport</RouterLink>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><RouterLink class="nav-link" to="/">Home</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/about">About</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/contact">Contact</RouterLink></li>
          <li class="nav-item" v-if="user">
            <RouterLink class="nav-link" to="/profile">Profile</RouterLink>
          </li>
          <li class="nav-item" v-if="user?.role === 'admin'">
            <RouterLink class="nav-link" to="/admin">Admin</RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto">
          <li v-if="!user" class="nav-item"><RouterLink class="nav-link" to="/login">Login</RouterLink></li>
          <li v-if="!user" class="nav-item"><RouterLink class="nav-link" to="/register">Register</RouterLink></li>

          <li v-else class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
              {{ user.username }} <span class="badge bg-secondary">{{ user.role }}</span>
            </a>
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
import { useRouter } from "vue-router";
import { useAuth } from "../composables/auth";

const router = useRouter();
const { currentUser, logout } = useAuth();
const user = computed(() => currentUser.value);

function doLogout() {
  logout();
  router.push({ name: "Home" });
}
</script>
