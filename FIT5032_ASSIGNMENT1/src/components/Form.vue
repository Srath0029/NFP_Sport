<template>
  <div class="card p-4 mb-4 shadow-sm">
    <h3>Register User</h3>
    <form @submit.prevent="handleSubmit" novalidate>
      <!-- First Name Field -->
      <div class="mb-3">
        <label for="firstName" class="form-label">First Name</label>
        <input
          type="text"
          id="firstName"
          v-model="firstName"
          class="form-control"
          :class="{ 'is-invalid': errors.firstName }"
          required
        />
        <div v-if="errors.firstName" class="invalid-feedback">{{ errors.firstName }}</div>
      </div>

      <!-- Last Name Field -->
      <div class="mb-3">
        <label for="lastName" class="form-label">Last Name</label>
        <input
          type="text"
          id="lastName"
          v-model="lastName"
          class="form-control"
          :class="{ 'is-invalid': errors.lastName }"
          required
        />
        <div v-if="errors.lastName" class="invalid-feedback">{{ errors.lastName }}</div>
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
          min="12"
          max="120"
        />
        <div v-if="errors.age" class="invalid-feedback">{{ errors.age }}</div>
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const age = ref(null);
const errors = ref({});

const emit = defineEmits(["formSubmitted"]);

const validate = () => {
  errors.value = {};
  let valid = true;

  if (!firstName.value.trim() || firstName.value.length < 2) {
    errors.value.firstName = "First name must be at least 2 characters.";
    valid = false;
  }
  if (!lastName.value.trim() || lastName.value.length < 2) {
    errors.value.lastName = "Last name must be at least 2 characters.";
    valid = false;
  }
  if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.value.email = "Enter a valid email address.";
    valid = false;
  }
  if (!age.value || age.value < 12 || age.value > 120) {
    errors.value.age = "Age must be between 12 and 120.";
    valid = false;
  }

  return valid;
};

const handleSubmit = () => {
  if (validate()) {
    emit("formSubmitted", {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      age: age.value,
    });
    firstName.value = "";
    lastName.value = "";
    email.value = "";
    age.value = null;
  }
};
</script>
