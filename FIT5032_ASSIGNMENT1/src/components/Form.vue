<template>
  <div class="card p-4 mb-4 shadow-sm">
    <h3>Register User</h3>
    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Name Field -->
      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input
          type="text"
          id="name"
          v-model="name"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          required
        />
        <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
      </div>
