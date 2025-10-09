// src/services/emailService.js
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

/**
 * Optional: point to the local Functions emulator during development.
 * Add to your .env:
 *   VITE_USE_FUNCTIONS_EMULATOR=true
 *   VITE_FUNCTIONS_EMULATOR_HOST=localhost
 *   VITE_FUNCTIONS_EMULATOR_PORT=5001
 */
function configureFunctions() {
  const functions = getFunctions();
  if (import.meta.env.VITE_USE_FUNCTIONS_EMULATOR === "true") {
    const host = import.meta.env.VITE_FUNCTIONS_EMULATOR_HOST || "localhost";
    const port = Number(import.meta.env.VITE_FUNCTIONS_EMULATOR_PORT || 5001);
    try {
      // Safe-guard: connect only once
      if (!(functions.__emulatorConnected)) {
        connectFunctionsEmulator(functions, host, port);
        functions.__emulatorConnected = true;
        // eslint-disable-next-line no-console
        console.log(`⚙️ Using Functions emulator at ${host}:${port}`);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Functions emulator connect skipped:", e?.message || e);
    }
  }
  return functions;
}

/**
 * Soft email format check (client-side convenience only).
 */
function isLikelyEmail(v) {
  return typeof v === "string" && /\S+@\S+\.\S+/.test(v);
}

/**
 * Convert plain text to minimal HTML (preserves newlines).
 */
export function textToHtml(text) {
  if (!text) return "";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(/\n/g, "<br>");
}

/**
 * Read a File as base64 string (without data: prefix).
 */
export function fileToBase64NoPrefix(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result; // "data:<mime>;base64,AAAA..."
      const clean = String(result).split(",")[1]; // strip "data:*;base64,"
      resolve(clean);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Build an attachment object for the callable function.
 * Enforces a size guard (default 7MB).
 */
async function buildAttachment(file, maxBytes = 7 * 1024 * 1024) {
  if (!(file instanceof File)) return null;
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(1);
    throw new Error(`Attachment too large. Max ${mb} MB allowed.`);
  }
  const contentBase64 = await fileToBase64NoPrefix(file);
  return {
    contentBase64,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}

/**
 * Callable: sendEmail (single recipient)
 * @param {Object} params
 * @param {string} params.to                - recipient email
 * @param {string} params.subject
 * @param {string} params.html              - HTML body (use textToHtml if needed)
 * @param {File|null} [params.file]         - optional File (browser)
 * @param {string|string[]} [params.cc]     - optional CC
 * @param {string|string[]} [params.bcc]    - optional BCC
 */
export async function sendEmailService({ to, subject, html, file, cc, bcc }) {
  if (!to || !subject || !html) {
    throw new Error("Missing required fields: to, subject, html.");
  }
  if (!isLikelyEmail(to)) {
    throw new Error("Recipient email looks invalid.");
  }

  const functions = configureFunctions();
  const fn = httpsCallable(functions, "sendEmail");

  const attachment = await buildAttachment(file).catch((e) => {
    // Re-throw with a cleaner message for the UI
    throw new Error(e?.message || "Failed to process attachment.");
  });

  const payload = { to, subject, html, attachment };

  // Optional CC/BCC support (if you add it in your function later)
  if (cc) payload.cc = Array.isArray(cc) ? cc : [cc];
  if (bcc) payload.bcc = Array.isArray(bcc) ? bcc : [bcc];

  const res = await fn(payload);
  return res.data; // expected: { ok: true }
}

/**
 * Callable: sendBulkEmail (multi recipient)
 * If you later add a `sendBulkEmail` function, this client is ready.
 * @param {Object} params
 * @param {string[]} params.to              - recipient list
 * @param {string} params.subject
 * @param {string} params.html
 * @param {File|null} [params.file]
 */
export async function sendBulkEmailService({ to = [], subject, html, file }) {
  if (!Array.isArray(to) || to.length === 0) {
    throw new Error("Provide a non-empty 'to' array.");
  }
  to.forEach((addr) => {
    if (!isLikelyEmail(addr)) throw new Error(`Invalid recipient: ${addr}`);
  });
  if (!subject || !html) throw new Error("Missing subject or html.");

  const functions = configureFunctions();
  const fn = httpsCallable(functions, "sendBulkEmail"); // implement server-side when ready

  const attachment = await buildAttachment(file).catch((e) => {
    throw new Error(e?.message || "Failed to process attachment.");
  });

  const res = await fn({ to, subject, html, attachment });
  return res.data;
}


