<template>
  <div class="card p-4 mb-4 shadow-sm">
    <h3 class="mb-3">Register User</h3>

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
            :class="{ 'is-invalid': showError('firstName') }"
            required
            autocomplete="given-name"
          />
          <div class="invalid-feedback" v-if="showError('firstName')">{{ errors.firstName }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="lastName" class="form-label">Last Name</label>
          <input
            id="lastName"
            type="text"
            v-model.trim="lastName"
            class="form-control"
            :class="{ 'is-invalid': showError('lastName') }"
            required
            autocomplete="family-name"
          />
          <div class="invalid-feedback" v-if="showError('lastName')">{{ errors.lastName }}</div>
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
            :class="{ 'is-invalid': showError('username') }"
            placeholder="min 3 characters; letters/numbers/._-"
            required
            pattern="^[A-Za-z0-9._-]+$"
            aria-describedby="userHelp"
            @blur="touched.username = true"
            autocomplete="username"
          />
          <small id="userHelp" class="text-muted">Allowed: letters, numbers, dot, underscore, hyphen</small>
          <div class="invalid-feedback" v-if="showError('username')">{{ errors.username }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            type="email"
            inputmode="email"
            v-model.trim="email"
            class="form-control"
            :class="{ 'is-invalid': showError('email') }"
            required
            autocomplete="email"
            @blur="touched.email = true"
          />
          <div class="invalid-feedback" v-if="showError('email')">{{ errors.email }}</div>
        </div>
      </div>

      <!-- Row 3: Password / Confirm Password -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            class="form-control"
            :class="{ 'is-invalid': showError('password') }"
            placeholder="min 8 chars incl. a number"
            required
            autocomplete="new-password"
            @blur="touched.password = true"
          />
          <div class="invalid-feedback" v-if="showError('password')">{{ errors.password }}</div>

          <!-- Strength meter -->
          <div class="mt-2">
            <div class="progress" style="height: 6px;">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{ width: strength + '%'}"
                :aria-valuenow="strength"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
            <small class="text-muted">Password strength</small>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="confirmPassword"
            class="form-control"
            :class="{ 'is-invalid': showError('confirmPassword') }"
            required
            autocomplete="new-password"
            @blur="touched.confirmPassword = true"
          />
          <div class="invalid-feedback" v-if="showError('confirmPassword')">{{ errors.confirmPassword }}</div>
        </div>
      </div>

      <!-- Row 4: Age / Location -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="age" class="form-label">Age</label>
          <input
            id="age"
            type="number"
            inputmode="numeric"
            v-model.number="age"
            class="form-control"
            :class="{ 'is-invalid': showError('age') }"
            min="13"
            max="120"
            required
            @blur="touched.age = true"
          />
          <div class="invalid-feedback" v-if="showError('age')">{{ errors.age }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="location" class="form-label">Location (Suburb)</label>
          <input
            id="location"
            type="text"
            v-model.trim="location"
            class="form-control"
            :class="{ 'is-invalid': showError('location') }"
            placeholder="e.g., Footscray"
            required
            autocomplete="address-level2"
            @blur="touched.location = true"
          />
          <div class="invalid-feedback" v-if="showError('location')">{{ errors.location }}</div>
        </div>
      </div>

      <!-- Row 5: Gender -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="gender" class="form-label">Gender</label>
          <select
            id="gender"
            v-model="gender"
            class="form-select"
            :class="{ 'is-invalid': showError('gender') }"
            required
            @blur="touched.gender = true"
          >
            <option disabled value="">Please select</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
            <option>Other</option>
          </select>
          <div class="invalid-feedback" v-if="showError('gender')">{{ errors.gender }}</div>
        </div>
      </div>

      <!-- Row 6: Reason -->
      <div class="mb-3">
        <label for="reason" class="form-label">Reason for joining</label>
        <textarea
          id="reason"
          v-model.trim="reason"
          class="form-control"
          rows="3"
          :class="{ 'is-invalid': showError('reason') }"
          placeholder="Tell us briefly why you want to join…"
          required
          maxlength="240"
          @blur="touched.reason = true"
        ></textarea>
        <div class="d-flex justify-content-between">
          <small class="text-muted">Min 10 characters</small>
          <small class="text-muted">{{ reason.length }}/240</small>
        </div>
        <div class="invalid-feedback" v-if="showError('reason')">{{ errors.reason }}</div>
      </div>

      <button type="submit" class="btn btn-primary" :disabled="!canSubmit">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  existingUsernames: { type: Array, default: () => [] }
});

const firstName = ref("");
const lastName = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const age = ref(null);
const location = ref("");
const gender = ref("");
const reason = ref("");

const errors = ref({});
const touched = ref({
  firstName: false, lastName: false, username: false, email: false,
  password: false, confirmPassword: false, age: false, location: false,
  gender: false, reason: false
});

const emit = defineEmits(["formSubmitted"]);

const strength = computed(() => {
  let s = 0;
  if (password.value.length >= 8) s += 30;
  if (/[A-Z]/.test(password.value)) s += 20;
  if (/[a-z]/.test(password.value)) s += 20;
  if (/\d/.test(password.value)) s += 20;
  if (/[^A-Za-z0-9]/.test(password.value)) s += 10;
  return Math.min(s, 100);
});

const validate = () => {
  errors.value = {};
  let valid = true;

  // Normalize some inputs
  firstName.value = firstName.value.trim().replace(/\s+/g, " ");
  lastName.value  = lastName.value.trim().replace(/\s+/g, " ");
  location.value  = location.value.trim().replace(/\s+/g, " ");
  reason.value    = reason.value.trim();

  if (!firstName.value || firstName.value.length < 2) {
    errors.value.firstName = "First name must be at least 2 characters.";
    valid = false;
  }
  if (!lastName.value || lastName.value.length < 2) {
    errors.value.lastName = "Last name must be at least 2 characters.";
    valid = false;
  }

  if (!username.value || username.value.length < 3) {
    errors.value.username = "Username must be at least 3 characters.";
    valid = false;
  } else if (!/^[A-Za-z0-9._-]+$/.test(username.value)) {
    errors.value.username = "Use letters, numbers, dot, underscore, or hyphen only.";
    valid = false;
  } else if (props.existingUsernames.includes(username.value.toLowerCase())) {
    errors.value.username = "Username is already taken.";
    valid = false;
  }

  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = "Enter a valid email address.";
    valid = false;
  }

  if (!password.value || password.value.length < 8 || !/\d/.test(password.value)) {
    errors.value.password = "Password must be 8+ characters and include a number.";
    valid = false;
  }
  if (password.value !== confirmPassword.value) {
    errors.value.confirmPassword = "Passwords do not match.";
    valid = false;
  }
  if (strength.value < 50) {
    errors.value.password = "Please choose a stronger password (mix case, add numbers/symbols).";
    valid = false;
  }

  if (!age.value || age.value < 13 || age.value > 120) {
    errors.value.age = "Age must be between 13 and 120.";
    valid = false;
  }

  if (!location.value) {
    errors.value.location = "Location is required.";
    valid = false;
  }
  if (!gender.value) {
    errors.value.gender = "Please select a gender option.";
    valid = false;
  }

  if (!reason.value || reason.value.length < 10) {
    errors.value.reason = "Please provide at least 10 characters.";
    valid = false;
  } else if (reason.value.length > 240) {
    errors.value.reason = "Maximum 240 characters.";
    valid = false;
  }

  return valid;
};

const canSubmit = computed(() =>
  firstName.value.length >= 2 &&
  lastName.value.length >= 2 &&
  username.value.length >= 3 && /^[A-Za-z0-9._-]+$/.test(username.value) &&
  !props.existingUsernames.includes(username.value.toLowerCase()) &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) &&
  password.value.length >= 8 && /\d/.test(password.value) &&
  confirmPassword.value === password.value &&
  strength.value >= 50 &&
  age.value >= 13 && age.value <= 120 &&
  location.value.length > 0 &&
  !!gender.value &&
  reason.value.length >= 10 && reason.value.length <= 240
);

const showError = (field) => touched.value[field] && !!errors.value[field];

const handleSubmit = () => {
  // mark all as touched so errors show if any
  Object.keys(touched.value).forEach(k => touched.value[k] = true);

  if (!validate()) return;

  // Emit the user object
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
    createdAt: new Date().toISOString()
  });

  // Reset form
  firstName.value = "";
  lastName.value = "";
  username.value = "";
  email.value = "";
  password.value = "";
  confirmPassword.value = "";
  age.value = null;
  location.value = "";
  gender.value = "";
  reason.value = "";
  errors.value = {};
  Object.keys(touched.value).forEach(k => touched.value[k] = false);
};
</script>
