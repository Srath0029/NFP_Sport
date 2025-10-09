<template>
  <div class="container mt-4">
    <h1>Admin Email Panel</h1>
    <p class="lead">Send emails with an optional attachment via SendGrid.</p>

    <form @submit.prevent="onSend" class="mt-3">
      <div class="mb-3">
        <label class="form-label">Recipient Email</label>
        <input v-model.trim="to" type="email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Subject</label>
        <input v-model.trim="subject" type="text" class="form-control" required />
      </div>

      <div class="mb-3">
        <label class="form-label">Message</label>
        <textarea v-model="body" class="form-control" rows="5" required></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Attachment (optional)</label>
        <input type="file" class="form-control" @change="onFile" />
      </div>

      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Sending…' : 'Send Email' }}
      </button>

      <div v-if="status" class="alert mt-3" :class="statusOk ? 'alert-success' : 'alert-danger'">
        {{ status }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { sendEmailViaHttp, textToHtml } from "../services/emailService";

const to = ref("");
const subject = ref("");
const body = ref("");
const file = ref(null);
const loading = ref(false);
const status = ref("");
const statusOk = ref(false);

function onFile(e) {
  file.value = e.target.files?.[0] ?? null;
}

async function onSend() {
  loading.value = true;
  status.value = "";
  statusOk.value = false;

  try {
    await sendEmailViaHttp({
      to: to.value,
      subject: subject.value,
      html: textToHtml(body.value),
      file: file.value,
    });
    statusOk.value = true;
    status.value = "✅ Email sent successfully.";
  } catch (err) {
    console.error(err);
    statusOk.value = false;
    status.value = "❌ Failed to send email.";
  } finally {
    loading.value = false;
  }
}
</script>
