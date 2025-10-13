// src/services/bookingsService.js
const BASE =
  import.meta.env.VITE_FB_FUNC_BASE ||
  "https://australia-southeast2-<YOUR-PROJECT-ID>.cloudfunctions.net";

export async function createBooking({ uid, programId, start, end }) {
  const res = await fetch(`${BASE}/createBooking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, programId, start, end }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${detail}`);
  }
  return res.json();
}
