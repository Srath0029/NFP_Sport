<template>
  <div class="container mt-4" style="max-width: 860px;" id="main">
    <div class="card p-4 shadow-sm">
      <h3 class="mb-3">Your Profile</h3>

      <form @submit.prevent="handleSave" novalidate>
        <!-- Row 1: First / Last -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="pfFirst">First Name</label>
            <input
              id="pfFirst"
              type="text"
              v-model.trim="firstName"
              class="form-control"
              :class="{ 'is-invalid': touched.firstName && errors.firstName }"
              @input="validateField('firstName')"
              @blur="touch('firstName')"
              autocomplete="given-name"
              :aria-invalid="touched.firstName && !!errors.firstName ? 'true' : 'false'"
            />
            <div class="invalid-feedback" v-if="touched.firstName && errors.firstName">{{ errors.firstName }}</div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label" for="pfLast">Last Name</label>
            <input
              id="pfLast"
              type="text"
              v-model.trim="lastName"
              class="form-control"
              :class="{ 'is-invalid': touched.lastName && errors.lastName }"
              @input="validateField('lastName')"
              @blur="touch('lastName')"
              autocomplete="family-name"
              :aria-invalid="touched.lastName && !!errors.lastName ? 'true' : 'false'"
            />
            <div class="invalid-feedback" v-if="touched.lastName && errors.lastName">{{ errors.lastName }}</div>
          </div>
        </div>

        <!-- Row 2: Age / Location -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="pfAge">Age</label>
            <input
              id="pfAge"
              type="number"
              v-model.number="age"
              class="form-control"
              :class="{ 'is-invalid': touched.age && errors.age }"
              min="13" max="120"
              @input="validateField('age')"
              @blur="touch('age')"
              :aria-invalid="touched.age && !!errors.age ? 'true' : 'false'"
            />
            <div class="invalid-feedback" v-if="touched.age && errors.age">{{ errors.age }}</div>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label" for="pfLocation">Location (Suburb)</label>
            <input
              id="pfLocation"
              type="text"
              v-model.trim="location"
              class="form-control"
              :class="{ 'is-invalid': touched.location && errors.location }"
              placeholder="e.g., Footscray"
              @input="validateField('location')"
              @blur="touch('location')"
              autocomplete="address-level2"
              :aria-invalid="touched.location && !!errors.location ? 'true' : 'false'"
            />
            <div class="invalid-feedback" v-if="touched.location && errors.location">{{ errors.location }}</div>
          </div>
        </div>

        <!-- Row 3: Gender -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label" for="pfGender">Gender</label>
            <select
              id="pfGender"
              v-model="gender"
              class="form-select"
              :class="{ 'is-invalid': touched.gender && errors.gender }"
              @change="validateField('gender')"
              @blur="touch('gender')"
              :aria-invalid="touched.gender && !!errors.gender ? 'true' : 'false'"
            >
              <option disabled value="">Please select</option>
              <option>Female</option>
              <option>Male</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
              <option>Other</option>
            </select>
            <div class="invalid-feedback" v-if="touched.gender && errors.gender">{{ errors.gender }}</div>
          </div>
        </div>

        <!-- Row 4: Reason -->
        <div class="mb-3">
          <label class="form-label" for="pfReason">Reason for joining</label>
          <textarea
            id="pfReason"
            v-model.trim="reason"
            class="form-control"
            rows="3"
            :class="{ 'is-invalid': touched.reason && errors.reason }"
            placeholder="Tell us why you want to join…"
            maxlength="240"
            @input="validateField('reason')"
            @blur="touch('reason')"
            aria-describedby="reasonHelp reasonCount"
            :aria-invalid="touched.reason && !!errors.reason ? 'true' : 'false'"
          ></textarea>
          <div class="d-flex justify-content-between">
            <small id="reasonHelp" class="text-muted">Min 10 characters</small>
            <small id="reasonCount" class="text-muted">{{ reason.length }}/240</small>
          </div>
          <div class="invalid-feedback" v-if="touched.reason && errors.reason">{{ errors.reason }}</div>
        </div>

        <!-- Buttons -->
        <div class="d-flex gap-2">
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save Profile' }}
          </button>
          <button type="button" class="btn btn-secondary" @click="clearForm" :disabled="saving">Clear</button>
        </div>

        <!-- Messages -->
        <p class="text-success mt-3" v-if="saved" role="status" aria-live="polite">Profile saved.</p>
        <p class="text-danger mt-3" v-if="error" role="status" aria-live="polite">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuth } from "../composables/auth";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const { currentUser } = useAuth();

const firstName = ref("");
const lastName  = ref("");
const age       = ref(null);
const location  = ref("");
const gender    = ref("");
const reason    = ref("");

const errors = ref({ firstName: "", lastName: "", age: "", location: "", gender: "", reason: "" });
const touched = ref({ firstName: false, lastName: false, age: false, location: false, gender: false, reason: false });

const saving = ref(false);
const saved  = ref(false);
const error  = ref("");

function touch(field) { touched.value[field] = true; }

function validateField(field) {
  switch (field) {
    case "firstName": errors.value.firstName = !firstName.value || firstName.value.length < 2 ? "First name must be at least 2 characters." : ""; break;
    case "lastName":  errors.value.lastName  = !lastName.value  || lastName.value.length  < 2 ? "Last name must be at least 2 characters."  : ""; break;
    case "age":       errors.value.age       = !age.value || age.value < 13 || age.value > 120 ? "Age must be between 13 and 120." : ""; break;
    case "location":  errors.value.location  = !location.value ? "Location is required." : ""; break;
    case "gender":    errors.value.gender    = !gender.value ? "Please select a gender option." : ""; break;
    case "reason":
      errors.value.reason =
        !reason.value || reason.value.length < 10 ? "Please provide at least 10 characters."
        : reason.value.length > 240 ? "Maximum 240 characters."
        : "";
      break;
  }
}

function validateAll() {
  Object.keys(touched.value).forEach(k => { touched.value[k] = true; validateField(k); });
  return Object.values(errors.value).every(v => !v);
}

async function loadProfile() {
  if (!currentUser.value?.uid) return;
  const snap = await getDoc(doc(db, "users", currentUser.value.uid));
  if (snap.exists()) {
    const p = snap.data();
    firstName.value = p.firstName || "";
    lastName.value  = p.lastName  || "";
    age.value       = p.age ?? null;
    location.value  = p.location || "";
    gender.value    = p.gender || "";
    reason.value    = p.reason || "";
  }
}

async function handleSave() {
  saved.value = false; error.value = "";
  if (!validateAll()) return;

  try {
    saving.value = true;
    await setDoc(doc(db, "users", currentUser.value.uid), {
      firstName: firstName.value.trim(),
      lastName:  lastName.value.trim(),
      age:       age.value,
      location:  location.value.trim(),
      gender:    gender.value,
      reason:    reason.value.trim(),
    }, { merge: true });
    saved.value = true;
  } catch (e) {
    error.value = e.message || "Failed to save profile.";
  } finally {
    saving.value = false;
  }
}

function clearForm() {
  firstName.value = lastName.value = location.value = gender.value = reason.value = "";
  age.value = null;
  Object.keys(errors.value).forEach(k => errors.value[k] = "");
  Object.keys(touched.value).forEach(k => touched.value[k] = false);
}

onMounted(loadProfile);
</script>
