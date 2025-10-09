<template>
  <div class="container mt-4">
    <h1>Admin Email Panel</h1>
    <p class="lead">Use this page to send emails with attachments via SendGrid (Cloudflare Pages Function).</p>

    <form class="mt-4" @submit.prevent="onSend">
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
        <textarea v-model="message" class="form-control" rows="5" required></textarea>
      </div>

      <div class="mb-3">
        <label class="form-label">Attachment (optional)</label>
        <input type="file" class="form-control" @change="onFileChange" />
      </div>

      <button class="btn btn-primary" type="submit" :disabled="loading">
        {{ loading ? "Sending..." : "Send Email" }}
      </button>

      <div v-if="status" class="alert alert-info mt-3">{{ status }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { sendEmailViaHttp } from "../services/emailService";

const to = ref("");
const subject = ref("");
const message = ref("");
const file = ref(null);
const status = ref("");
const loading = ref(false);

// keep this helper in THIS block so it's defined when onSend runs
function textToHtml(txt) {
  const s = String(txt ?? "");
  const escaped = s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\r?\n/g, "<br>");
}

function onFileChange(e) {
  file.value = e.target.files?.[0] ?? null;
}

async function onSend() {
  status.value = "";
  loading.value = true;
  try {
    const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif">${textToHtml(message.value)}</div>`;
    await sendEmailViaHttp({
      to: to.value.trim(),
      subject: subject.value.trim(),
      html,
      file: file.value ?? null,
    });
    status.value = "✅ Email sent!";
  } catch (err) {
    console.error(err);
    status.value = "❌ Failed to send email.";
  } finally {
    loading.value = false;
  }
}
</script>
