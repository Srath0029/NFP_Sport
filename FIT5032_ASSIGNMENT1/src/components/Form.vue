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

            <!-- Email Field -->
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          id="email"
          v-model="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
          required
        />
        <div v-if="errors.email" class="invalid-feedback">{{ errors.email }}</div>
      </div>

            <!-- Age Field -->
      <div class="mb-3">
        <label for="age" class="form-label">Age</label>
        <input
          type="number"
          id="age"
          v-model.number="age"
          class="form-control"
          :class="{ 'is-invalid': errors.age }"
          min="1"
          max="120"
        />
        <div v-if="errors.age" class="invalid-feedback">{{ errors.age }}</div>
      </div>
