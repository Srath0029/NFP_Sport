import axios from "axios";

const SENDGRID_URL = "https://api.sendgrid.com/v3/mail/send";
const SENDGRID_KEY = import.meta.env.VITE_SENDGRID_API_KEY;
const FROM_EMAIL = import.meta.env.VITE_SENDGRID_FROM;

export async function sendEmail({ to, subject, body, attachment }) {
  try {
    const msg = {
      personalizations: [{ to: [{ email: to }], subject }],
      from: { email: FROM_EMAIL, name: "NFP Admin" },
      content: [{ type: "text/html", value: body }],
    };

    if (attachment) {
      const response = await fetch(attachment);
      const blob = await response.blob();

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      msg.attachments = [
        {
          content: base64,
          filename: attachment.split("/").pop() || "attachment",
          type: blob.type || "application/octet-stream",
          disposition: "attachment",
        },
      ];
    }

    await axios.post(SENDGRID_URL, msg, {
      headers: {
        Authorization: `Bearer ${SENDGRID_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ SendGrid error:", error.response?.data || error);
    throw error;
  }
}
