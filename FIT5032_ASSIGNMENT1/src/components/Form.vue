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
            :class="{ 'is-invalid': touched.firstName && errors.firstName }"
            autocomplete="given-name"
            @input="validateField('firstName')"
            @blur="touch('firstName')"
          />
          <div class="invalid-feedback" v-if="touched.firstName && errors.firstName">
            {{ errors.firstName }}
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="lastName" class="form-label">Last Name</label>
          <input
            id="lastName"
            type="text"
            v-model.trim="lastName"
            class="form-control"
            :class="{ 'is-invalid': touched.lastName && errors.lastName }"
            autocomplete="family-name"
            @input="validateField('lastName')"
            @blur="touch('lastName')"
          />
          <div class="invalid-feedback" v-if="touched.lastName && errors.lastName">
            {{ errors.lastName }}
          </div>
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
            :class="{ 'is-invalid': touched.username && errors.username }"
            placeholder="min 3 characters; letters/numbers/._-"
            autocomplete="username"
            @input="validateField('username')"
            @blur="touch('username')"
          />
          <small class="text-muted">Allowed: letters, numbers, dot, underscore, hyphen</small>
          <div class="invalid-feedback" v-if="touched.username && errors.username">
            {{ errors.username }}
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            type="email"
            v-model.trim="email"
            class="form-control"
            :class="{ 'is-invalid': touched.email && errors.email }"
            autocomplete="email"
            @input="validateField('email')"
            @blur="touch('email')"
          />
          <div class="invalid-feedback" v-if="touched.email && errors.email">
            {{ errors.email }}
          </div>
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
            :class="{ 'is-invalid': touched.password && errors.password }"
            placeholder="min 8 chars incl. a number"
            autocomplete="new-password"
            @input="() => { validateField('password'); validateField('confirmPassword'); }"
            @blur="touch('password')"
          />
          <div class="invalid-feedback" v-if="touched.password && errors.password">
            {{ errors.password }}
          </div>

          <!-- Strength meter (simple) -->
          <div class="mt-2">
            <div class="progress" style="height: 6px;">
              <div class="progress-bar" role="progressbar" :style="{ width: strength + '%' }"></div>
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
            :class="{ 'is-invalid': touched.confirmPassword && errors.confirmPassword }"
            autocomplete="new-password"
            @input="validateField('confirmPassword')"
            @blur="touch('confirmPassword')"
          />
          <div class="invalid-feedback" v-if="touched.confirmPassword && errors.confirmPassword">
            {{ errors.confirmPassword }}
          </div>
        </div>
      </div>

      <!-- Row 4: Age / Location -->
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="age" class="form-label">Age</label>
          <input
            id="age"
            type="number"
            v-model.number="age"
            class="form-control"
            :class="{ 'is-invalid': touched.age && errors.age }"
            min="13" max="120"
            @input="validateField('age')"
            @blur="touch('age')"
          />
          <div class="invalid-feedback" v-if="touched.age && errors.age">
            {{ errors.age }}
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <label for="location" class="form-label">Location (Suburb)</label>
          <input
            id="location"
            type="text"
            v-model.trim="location"
            class="form-control"
            :class="{ 'is-invalid': touched.location && errors.location }"
            placeholder="e.g., Footscray"
            @input="validateField('location')"
            @blur="touch('location')"
          />
          <div class="invalid-feedback" v-if="touched.location && errors.location">
            {{ errors.location }}
          </div>
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
            :class="{ 'is-invalid': touched.gender && errors.gender }"
            @change="validateField('gender')"
            @blur="touch('gender')"
          >
            <option disabled value="">Please select</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
            <option>Other</option>
          </select>
          <div class="invalid-feedback" v-if="touched.gender && errors.gender">
            {{ errors.gender }}
          </div>
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
          :class="{ 'is-invalid': touched.reason && errors.reason }"
          placeholder="Tell us why you want to join…"
          maxlength="240"
          @input="validateField('reason')"
          @blur="touch('reason')"
        ></textarea>
        <div class="d-flex justify-content-between">
          <small class="text-muted">Min 10 characters</small>
          <small class="text-muted">{{ reason.length }}/240</small>
        </div>
        <div class="invalid-feedback" v-if="touched.reason && errors.reason">
          {{ errors.reason }}
        </div>
      </div>

      <!-- Submit stays enabled so you can demonstrate errors -->
      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// If App.vue passes existing usernames, accept them; otherwise default to []
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

const errors = ref({
  firstName: "", lastName: "", username: "", email: "",
  password: "", confirmPassword: "", age: "", location: "",
  gender: "", reason: ""
});
const touched = ref({
  firstName: false, lastName: false, username: false, email: false,
  password: false, confirmPassword: false, age: false, location: false,
  gender: false, reason: false
});

const strength = computed(() => {
  let s = 0;
  if (password.value.length >= 8) s += 30;
  if (/[A-Z]/.test(password.value)) s += 20;
  if (/[a-z]/.test(password.value)) s += 20;
  if (/\d/.test(password.value)) s += 20;
  if (/[^A-Za-z0-9]/.test(password.value)) s += 10;
  return Math.min(s, 100);
});

function touch(field) {
  touched.value[field] = true;
}

function validateField(field) {
  switch (field) {
    case "firstName":
      errors.value.firstName =
        !firstName.value || firstName.value.length < 2 ? "First name must be at least 2 characters." : "";
      break;
    case "lastName":
      errors.value.lastName =
        !lastName.value || lastName.value.length < 2 ? "Last name must be at least 2 characters." : "";
      break;
    case "username":
      if (!username.value || username.value.length < 3) {
        errors.value.username = "Username must be at least 3 characters.";
      } else if (!/^[A-Za-z0-9._-]+$/.test(username.value)) {
        errors.value.username = "Use letters, numbers, dot, underscore, or hyphen only.";
      } else if (props.existingUsernames.includes(username.value.toLowerCase())) {
        errors.value.username = "Username is already taken.";
      } else {
        errors.value.username = "";
      }
      break;
    case "email":
      errors.value.email =
        !email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
          ? "Enter a valid email address."
          : "";
      break;
    case "password":
      errors.value.password =
        !password.value || password.value.length < 8 || !/\d/.test(password.value) || strength.value < 50
          ? "Password must be 8+ chars, include a number, and be stronger."
          : "";
      break;
    case "confirmPassword":
      errors.value.confirmPassword =
        password.value !== confirmPassword.value ? "Passwords do not match." : "";
      break;
    case "age":
      errors.value.age =
        !age.value || age.value < 13 || age.value > 120 ? "Age must be between 13 and 120." : "";
      break;
    case "location":
      errors.value.location = !location.value ? "Location is required." : "";
      break;
    case "gender":
      errors.value.gender = !gender.value ? "Please select a gender option." : "";
      break;
    case "reason":
      errors.value.reason =
        !reason.value || reason.value.length < 10
          ? "Please provide at least 10 characters."
          : reason.value.length > 240
          ? "Maximum 240 characters."
          : "";
      break;
  }
}

function validateAll() {
  // mark all as touched and validate each
  Object.keys(touched.value).forEach((k) => {
    touched.value[k] = true;
    validateField(k);
  });
  // valid if every error string is empty
  return Object.values(errors.value).every((v) => !v);
}

const emit = defineEmits(["formSubmitted"]);

function handleSubmit() {
  if (!validateAll()) return;

  emit("formSubmitted", {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value,
    age: age.value,
    location: location.value.trim(),
    gender: gender.value,
    reason: reason.value.trim(),
    createdAt: new Date().toISOString()
  });

  // reset
  firstName.value = lastName.value = username.value = email.value = "";
  password.value = confirmPassword.value = "";
  age.value = null;
  location.value = gender.value = reason.value = "";
  Object.keys(errors.value).forEach((k) => (errors.value[k] = ""));
  Object.keys(touched.value).forEach((k) => (touched.value[k] = false));
}
</script>
