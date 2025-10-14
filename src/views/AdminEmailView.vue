<template>
  <div class="container mt-4" style="max-width: 820px;">
    <h1 class="h3">Admin Email Panel</h1>
    <p class="text-muted">
      Send one or bulk emails via SendGrid (Cloudflare Pages Function).
    </p>

    <form class="mt-3" @submit.prevent="onSend">
      <!-- Recipients -->
      <div class="mb-3">
        <label class="form-label" for="recipients">Recipients</label>
        <textarea
          id="recipients"
          v-model.trim="recipients"
          class="form-control"
          rows="3"
          placeholder="Paste emails separated by comma or new lines"
          required
        ></textarea>
        <small class="text-muted">
          Example: alice@example.com, bob@example.com or one per line.
        </small>
      </div>

      <!-- Subject -->
      <div class="mb-3">
        <label class="form-label" for="subject">Subject</label>
        <input id="subject" v-model.trim="subject" type="text" class="form-control" required />
      </div>

      <!-- Message -->
      <div class="mb-3">
        <label class="form-label" for="message">Message (HTML supported)</label>
        <textarea
          id="message"
          v-model="message"
          class="form-control"
          rows="6"
          placeholder="Write your message…"
          required
        ></textarea>
        <small class="text-muted">Line breaks will be preserved.</small>
      </div>

      <!-- Attachment -->
      <div class="mb-3">
        <label class="form-label" for="attachment">Attachment (optional)</label>
        <input id="attachment" type="file" class="form-control" @change="onFileChange" />
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary" type="submit" :disabled="loading">
          {{ loading ? "Sending…" : "Send" }}
        </button>
        <button class="btn btn-outline-secondary" type="button" @click="clearForm" :disabled="loading">
          Clear
        </button>
      </div>

      <div class="alert alert-info mt-3 py-2" v-if="status">{{ status }}</div>
      <div class="alert alert-danger mt-3 py-2" v-if="error">{{ error }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { sendBulkEmails } from "../services/emailService";

// form state
const recipients = ref("");   // string (comma or newline)
const subject    = ref("");
const message    = ref("");
const file       = ref(null);

const loading = ref(false);
const status  = ref("");
const error   = ref("");

// Keep this helper inside the SFC so it's defined when onSend runs
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

function clearForm() {
  recipients.value = "";
  subject.value = "";
  message.value = "";
  file.value = null;
  status.value = "";
  error.value = "";
}

async function onSend() {
  status.value = ""; error.value = ""; loading.value = true;
  try {
    const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif">${textToHtml(message.value)}</div>`;
    await sendBulkEmails({
      recipients: recipients.value, // string or array
      subject: subject.value,
      html,
      file: file.value ?? null,
    });
    status.value = "✅ Emails sent!";
  } catch (e) {
    console.error(e);
    error.value = e?.message || "❌ Failed to send.";
  } finally {
    loading.value = false;
  }
}
</script>
