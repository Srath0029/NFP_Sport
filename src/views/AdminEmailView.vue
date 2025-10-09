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
  const f = e.target.files?.[0];
  file.value = f || null;
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
