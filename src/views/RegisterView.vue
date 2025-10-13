<!-- src/views/RegisterView.vue -->
<template>
  <div class="container mt-5" style="max-width: 840px;">
    <Form
      :existingUsernames="existingUsernames"
      @formSubmitted="handleRegister"
    />
    <p class="text-success mt-3" v-if="okMsg">{{ okMsg }}</p>
    <p class="text-danger mt-3" v-if="errMsg">{{ errMsg }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useAuth } from "../composables/auth";
import Form from "../components/Form.vue";

const router = useRouter();
const { register } = useAuth();

const existingUsernames = ref<string[]>([]);
const okMsg = ref("");
const errMsg = ref("");

// Load all usernames once for client-side uniqueness check
onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, "users"));
    existingUsernames.value = snap.docs
      .map(d => (d.data()?.username || "").toString().toLowerCase())
      .filter(Boolean);
  } catch (e) {
    // keep quiet; validation will still run server-side via Firestore rules if you have them
    console.warn("Username preload failed:", e);
  }
});

async function handleRegister(formData: {
  firstName: string; lastName: string; username: string; email: string; password: string;
  age: number|null; location: string; gender: string; reason: string; createdAt: string;
}) {
  okMsg.value = ""; errMsg.value = "";
  try {
    // 1) Create Auth user
    const cred = await register({ email: formData.email, password: formData.password, username: formData.username });

    // 2) Write user profile doc
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      email: formData.email,
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: formData.age,
      location: formData.location,
      gender: formData.gender,
      reason: formData.reason,
      role: "member",
      createdAt: formData.createdAt,
    }, { merge: true });

    okMsg.value = "Account created! Redirecting to your profile…";
    setTimeout(() => router.push({ name: "Profile" }), 800);
  } catch (e:any) {
    console.error(e);
    errMsg.value = e?.message || "Registration failed.";
  }
}
</script>
