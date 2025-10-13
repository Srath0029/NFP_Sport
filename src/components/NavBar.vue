<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" to="/">NFP Sport</RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        @click="navOpen = !navOpen"
        :aria-expanded="navOpen ? 'true' : 'false'"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" :class="{ show: navOpen }" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item"><RouterLink class="nav-link" to="/" @click="closeAll">Home</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/about" @click="closeAll">About</RouterLink></li>
          <li class="nav-item"><RouterLink class="nav-link" to="/contact" @click="closeAll">Contact</RouterLink></li>

          <!-- Map (E.2) -->
          <li class="nav-item"><RouterLink class="nav-link" to="/map" @click="closeAll">Map</RouterLink></li>

          <!-- ✅ NEW: Bookings link (Feature F.1) -->
          <li class="nav-item" v-if="user">
            <RouterLink class="nav-link" to="/bookings" @click="closeAll">Bookings</RouterLink>
          </li>

          <li class="nav-item" v-if="user">
            <RouterLink class="nav-link" to="/profile" @click="closeAll">Profile</RouterLink>
          </li>

          <!-- Admin dropdown (Vue-only, no Bootstrap JS) -->
          <li class="nav-item dropdown" v-if="isAdmin" ref="adminRef">
            <button
              class="nav-link dropdown-toggle border-0 bg-transparent"
              type="button"
              @click="toggle('admin')"
              @keydown.escape="close('admin')"
              :aria-expanded="adminOpen ? 'true' : 'false'"
            >
              Admin
            </button>
            <ul class="dropdown-menu" :class="{ show: adminOpen }" style="min-width: 14rem;">
              <li><RouterLink class="dropdown-item" to="/admin" @click="closeAll">Dashboard</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/admin/tables" @click="closeAll">Programs Table</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/admin/users" @click="closeAll">Users Table</RouterLink></li>
              <li><RouterLink class="dropdown-item" to="/admin/email" @click="closeAll">Email Panel</RouterLink></li>
            </ul>
          </li>
        </ul>

        <!-- User dropdown -->
        <ul class="navbar-nav ms-auto" ref="userRef">
          <li v-if="!user" class="nav-item"><RouterLink class="nav-link" to="/login" @click="closeAll">Login</RouterLink></li>
          <li v-if="!user" class="nav-item"><RouterLink class="nav-link" to="/register" @click="closeAll">Register</RouterLink></li>

          <li v-else class="nav-item dropdown">
            <button
              class="nav-link dropdown-toggle border-0 bg-transparent"
              type="button"
              @click="toggle('user')"
              @keydown.escape="close('user')"
              :aria-expanded="userOpen ? 'true' : 'false'"
            >
              {{ user.username }} <span class="badge bg-secondary">{{ user.role }}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" :class="{ show: userOpen }">
              <li><button class="dropdown-item" @click="doLogout">Logout</button></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "../composables/auth";

const router = useRouter();
const { currentUser, logout } = useAuth();

const user = computed(() => currentUser.value || null);
const isAdmin = computed(() => !!(currentUser.value && currentUser.value.role === "admin"));

const navOpen   = ref(false);
const adminOpen = ref(false);
const userOpen  = ref(false);

const adminRef = ref(null);
const userRef  = ref(null);

function closeAll() {
  navOpen.value = false;
  adminOpen.value = false;
  userOpen.value = false;
}
function toggle(which) {
  if (which === 'admin') { adminOpen.value = !adminOpen.value; userOpen.value = false; }
  if (which === 'user')  { userOpen.value  = !userOpen.value;  adminOpen.value = false; }
}
function close(which) {
  if (which === 'admin') adminOpen.value = false;
  if (which === 'user')  userOpen.value = false;
}
function doLogout() {
  closeAll();
  logout();
  router.push({ name: "Home" });
}

function onDocClick(e) {
  const a = adminRef.value, u = userRef.value;
  if (a && !a.contains(e.target)) adminOpen.value = false;
  if (u && !u.contains(e.target)) userOpen.value = false;
}
let unreg;
onMounted(() => {
  document.addEventListener('click', onDocClick);
  unreg = router.afterEach(() => closeAll());
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick);
  unreg && unreg();
});
</script>

<style>
.navbar { position: sticky; top: 0; z-index: 3000; }
.dropdown-menu.show { display: block; }
</style>
