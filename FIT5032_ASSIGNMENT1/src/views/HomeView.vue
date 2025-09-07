<template>
  <div class="container py-5">
    <div class="row align-items-center g-4">
      <div class="col-lg-6">
        <h1 class="display-6 fw-bold">Move more. Feel better. Connect through community sport.</h1>
        <p class="lead">
          We help young adults in Melbourne join affordable, inclusive sport programs that boost physical
          and mental wellbeing.
        </p>
        <div class="d-flex gap-2">
          <RouterLink class="btn btn-primary btn-lg" to="/register">Get Started</RouterLink>
          <RouterLink class="btn btn-outline-secondary btn-lg" to="/login">Log In</RouterLink>
        </div>
      </div>
      <div class="col-lg-6">
        <RatingWidget itemKey="overall_website_experience" title="Rate your experience with the website" />
      </div>
    </div>
  </div>
</template>

<script setup>
import RatingWidget from "../components/RatingWidget.vue";
</script>
