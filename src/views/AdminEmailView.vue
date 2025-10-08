<script setup>
import { ref } from "vue";
import { sendEmail as sendEmailApi } from "../services/emailService"; // ✅ rename import

const to = ref("");
const subject = ref("");
const body = ref("");
const attachment = ref("");
const loading = ref(false);
const status = ref("");

const sendEmail = async () => {            // ✅ local submit handler
  loading.value = true;
  status.value = "";
  try {
    await sendEmailApi({                   // ✅ call the renamed import
      to: to.value,
      subject: subject.value,
      body: body.value,
      attachment: attachment.value || null,
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
