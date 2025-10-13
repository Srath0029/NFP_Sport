<!-- src/App.vue -->
<template>
  <div id="app">
    <NavBar />
    <RouterView />
  </div>
</template>

<script setup>
import NavBar from "./components/NavBar.vue";
</script>
<template>
  <a href="#main" class="visually-hidden-focusable position-absolute top-0 start-0 m-2 btn btn-warning btn-sm">
    Skip to content
  </a>
  <div id="app">
    <NavBar />
    <RouterView />
  </div>
</template>
