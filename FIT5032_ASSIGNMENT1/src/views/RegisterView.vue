<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/auth";

const router = useRouter();
const { register } = useAuth();

const username = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const success = ref("");

async function submit() {
  error.value = ""; success.value = "";
  if (password.value !== confirm.value) { error.value = "Passwords do not match"; return; }
  if (password.value.length < 8 || !/\d/.test(password.value)) {
    error.value = "Password must be 8+ characters and include a number."; return;
  }
  try {
    await register({ email: email.value, password: password.value, username: username.value });
    router.push({ name: "Profile" }); // << redirect to profile
  } catch (e) {
    error.value = e.message || "Registration failed";
  }
}
</script>
