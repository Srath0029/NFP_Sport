<template>
  <div class="container mt-4">
    <h1>Admin Email Panel</h1>
    <p class="lead">Use this page to send emails with attachments via SendGrid.</p>

    <!-- Example Email Form -->
    <form @submit.prevent="sendEmail" class="mt-4">
      <div class="mb-3">
        <label class="form-label">Recipient Email</label>
        <input v-model="to" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Subject</label>
        <input v-model="subject" type="text" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Message</label>
        <textarea v-model="body" class="form-control" rows="4" required></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Attachment URL (optional)</label>
        <input v-model="attachment" type="url" class="form-control" />
      </div>

      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Email' }}
      </button>

      <div v-if="status" class="alert alert-info mt-3">{{ status }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { sendEmail } from "../services/emailService"; // you’ll create this next

const to = ref("");
const subject = ref("");
const body = ref("");
const attachment = ref("");
const loading = ref(false);
const status = ref("");

const sendEmail = async () => {
  loading.value = true;
  try {
    await sendEmail({
      to: to.value,
      subject: subject.value,
      body: body.value,
      attachment: attachment.value,
    });
    status.value = "✅ Email sent successfully!";
  } catch (err) {
    console.error(err);
    status.value = "❌ Failed to send email.";
  } finally {
    loading.value = false;
  }
};
</script>
