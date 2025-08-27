<template>
  <div class="card p-4 mb-4 shadow-sm">
    <h3>Register User</h3>

    <form @submit.prevent="handleSubmit" novalidate>
      <!-- Row 1: First / Last -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="firstName" class="form-label">First Name</label>
          <input
            id="firstName"
            type="text"
            v-model.trim="firstName"
            class="form-control"
            :class="{ 'is-invalid': errors.firstName }"
            required
          />
          <div class="invalid-feedback" v-if="errors.firstName">{{ errors.firstName }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="lastName" class="form-label">Last Name</label>
          <input
            id="lastName"
            type="text"
            v-model.trim="lastName"
            class="form-control"
            :class="{ 'is-invalid': errors.lastName }"
            required
          />
          <div class="invalid-feedback" v-if="errors.lastName">{{ errors.lastName }}</div>
        </div>
      </div>

      <!-- Row 2: Username / Email -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="username" class="form-label">Username</label>
          <input
            id="username"
            type="text"
            v-model.trim="username"
            class="form-control"
            :class="{ 'is-invalid': errors.username }"
            placeholder="min 3 characters, letters/numbers/._-"
            required
          />
          <div class="invalid-feedback" v-if="errors.username">{{ errors.username }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            type="email"
            v-model.trim="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            required
          />
          <div class="invalid-feedback" v-if="errors.email">{{ errors.email }}</div>
        </div>
      </div>

      <!-- Row 3: Password / Age -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            placeholder="min 8 chars incl. a number"
            required
          />
          <div class="invalid-feedback" v-if="errors.password">{{ errors.password }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="age" class="form-label">Age</label>
          <input
            id="age"
            type="number"
            v-model.number="age"
            class="form-control"
            :class="{ 'is-invalid': errors.age }"
            min="13"
            max="120"
            required
          />
          <div class="invalid-feedback" v-if="errors.age">{{ errors.age }}</div>
        </div>
      </div>

      <!-- Row 4: Location / Gender -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="location" class="form-label">Location (Suburb)</label>
          <input
            id="location"
            type="text"
            v-model.trim="location"
            class="form-control"
            :class="{ 'is-invalid': errors.location }"
            placeholder="e.g., Footscray"
            required
          />
          <div class="invalid-feedback" v-if="errors.location">{{ errors.location }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="gender" class="form-label">Gender</label>
          <select
            id="gender"
            v-model="gender"
            class="form-select"
            :class="{ 'is-invalid': errors.gender }"
            required
          >
            <option disabled value="">Please select</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
            <option>Other</option>
          </select>
          <div class="invalid-feedback" v-if="errors.gender">{{ errors.gender }}</div>
        </div>
      </div>

      <!-- Row 5: Reason for joining -->
      <div class="mb-3">
        <label for="reason" class="form-label">Reason for joining</label>
        <textarea
          id="reason"
          v-model.trim="reason"
          class="form-control"
          rows="3"
          :class="{ 'is-invalid': errors.reason }"
          placeholder="Tell us briefly why you want to join…"
          required
        ></textarea>
        <div class="d-flex justify-content-between">
          <small class="text-muted">Min 10 characters</small>
          <small class="text-muted">{{ reason.length }}/240</small>
        </div>
        <div class="invalid-feedback" v-if="errors.reason">{{ errors.reason }}</div>
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";

const firstName = ref("");
const lastName = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const age = ref(null);
const location = ref("");
const gender = ref("");
const reason = ref("");
const errors = ref({});

const emit = defineEmits(["formSubmitted"]);

const validate = () => {
  errors.value = {};
  let valid = true;

  // First / Last name: required + min length
  if (!firstName.value || firstName.value.length < 2) {
    errors.value.firstName = "First name must be at least 2 characters.";
    valid = false;
  }
  if (!lastName.value || lastName.value.length < 2) {
    errors.value.lastName = "Last name must be at least 2 characters.";
    valid = false;
  }

  // Username: required + pattern + min length
  if (!username.value || username.value.length < 3) {
    errors.value.username = "Username must be at least 3 characters.";
    valid = false;
  } else if (!/^[A-Za-z0-9._-]+$/.test(username.value)) {
    errors.value.username = "Username can include letters, numbers, ., _, - only.";
    valid = false;
  }

  // Email: simple format check
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Enter a valid email address.";
    valid = false;
  }

  // Password: min 8, at least one number
  if (!password.value || password.value.length < 8 || !/\d/.test(password.value)) {
    errors.value.password = "Password must be 8+ characters and include a number.";
    valid = false;
  }

  // Age: required range (13–120 to reflect app policy)
  if (!age.value || age.value < 13 || age.value > 120) {
    errors.value.age = "Age must be between 13 and 120.";
    valid = false;
  }

  // Location required
  if (!location.value) {
    errors.value.location = "Location is required.";
    valid = false;
  }

  // Gender required
  if (!gender.value) {
    errors.value.gender = "Please select a gender option.";
    valid = false;
  }

  // Reason: min 10, max 240
  if (!reason.value || reason.value.length < 10) {
    errors.value.reason = "Please provide at least 10 characters.";
    valid = false;
  } else if (reason.value.length > 240) {
    errors.value.reason = "Maximum 240 characters.";
    valid = false;
  }

  return valid;
};

const handleSubmit = () => {
  if (!validate()) return;

  emit("formSubmitted", {
    firstName: firstName.value,
    lastName: lastName.value,
    username: username.value,
    email: email.value,

    password: password.value,
    age: age.value,
    location: location.value,
    gender: gender.value,
    reason: reason.value,
    createdAt: new Date().toISOString(),
  });

  // Reset form
  firstName.value = "";
  lastName.value = "";
  username.value = "";
  email.value = "";
  password.value = "";
  age.value = null;
  location.value = "";
  gender.value = "";
  reason.value = "";
  errors.value = {};
};
</script>
