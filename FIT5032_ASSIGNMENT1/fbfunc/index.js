// fbfunc/index.js
// Firebase Functions v2 (Node 20)
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
try { admin.app(); } catch { admin.initializeApp(); }

const db = admin.firestore();

/** Allow CORS for dev + prod. Adjust as needed. */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  // 'https://your-pages-domain.pages.dev'
];
function withCors(handler) {
  return async (req, res) => {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
    }
    res.set('Vary', 'Origin');
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).end();
    return handler(req, res);
  };
}

/* ===========================
   PUBLIC API: list programs
   GET /publicPrograms?limit=50&suburb=Fitzroy
=========================== */
exports.publicPrograms = onRequest(
  { region: 'australia-southeast2', cors: false },
  withCors(async (req, res) => {
    try {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
      const { limit = '50', suburb } = req.query;

      let ref = db.collection('programs');
      if (suburb) ref = ref.where('suburb', '==', String(suburb));
      const snap = await ref.limit(Math.min(parseInt(limit, 10) || 50, 200)).get();

      const programs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.active !== false)
        .map(p => ({
          id: p.id,
          title: p.title || '',
          type: p.type || '',
          days: Array.isArray(p.days) ? p.days : [],
          suburb: p.suburb || '',
          address: p.address || '',
          lat: Number.isFinite(+p.lat) ? +p.lat : null,
          lng: Number.isFinite(+p.lng) ? +p.lng : null,
          capacity: Number.isFinite(+p.capacity) ? +p.capacity : null,
        }));

      // cache small public GETs a little
      res.set('Cache-Control', 'public, max-age=60');
      return res.json({ ok: true, count: programs.length, programs });
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  })
);

/* ===========================
   PUBLIC API: single program
   GET /publicProgram?id=<programId>
=========================== */
exports.publicProgram = onRequest(
  { region: 'australia-southeast2', cors: false },
  withCors(async (req, res) => {
    try {
      if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
      const id = String(req.query.id || '');
      if (!id) return res.status(400).json({ ok: false, error: 'Missing ?id' });

      const doc = await db.collection('programs').doc(id).get();
      if (!doc.exists) return res.status(404).json({ ok: false, error: 'Not found' });

      const p = doc.data();
      if (p.active === false) return res.status(404).json({ ok: false, error: 'Not found' });

      res.set('Cache-Control', 'public, max-age=60');
      return res.json({
        ok: true,
        program: {
          id: doc.id,
          title: p.title || '',
          type: p.type || '',
          days: Array.isArray(p.days) ? p.days : [],
          suburb: p.suburb || '',
          address: p.address || '',
          lat: Number.isFinite(+p.lat) ? +p.lat : null,
          lng: Number.isFinite(+p.lng) ? +p.lng : null,
          capacity: Number.isFinite(+p.capacity) ? +p.capacity : null,
          description: p.description || '',
        },
      });
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  })
);

/* ===========================
   BOOKING: POST /createBooking
   body: { uid, programId, start, end }
=========================== */
exports.createBooking = onRequest(
  { region: 'australia-southeast2', cors: false },
  withCors(async (req, res) => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

      const { uid, programId, start, end } = req.body || {};
      if (!uid || !programId || !start || !end) {
        return res.status(400).json({ error: 'Missing uid, programId, start, end' });
      }

      const startTs = new Date(start).getTime();
      const endTs = new Date(end).getTime();
      if (!isFinite(startTs) || !isFinite(endTs) || endTs <= startTs) {
        return res.status(400).json({ error: 'Invalid start/end' });
      }

      // Load program
      const progSnap = await db.collection('programs').doc(programId).get();
      if (!progSnap.exists) return res.status(404).json({ error: 'Program not found' });
      const prog = progSnap.data();
      if (prog.active === false) return res.status(400).json({ error: 'Program inactive' });
      const capacity = Number(prog.capacity) || 0;

      const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

      // all bookings for program with status pending/confirmed
      const byProgram = await db
        .collection('bookings')
        .where('programId', '==', programId)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      const conflictingForProgram = byProgram.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => overlaps(startTs, endTs, new Date(b.start).getTime(), new Date(b.end).getTime()));

      if (capacity > 0 && conflictingForProgram.length >= capacity) {
        return res.status(409).json({ error: 'Program at capacity for this time' });
      }

      // prevent user overlap with any program
      const byUser = await db
        .collection('bookings')
        .where('uid', '==', uid)
        .where('status', 'in', ['pending', 'confirmed'])
        .get();

      const conflictingForUser = byUser.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .some(b => overlaps(startTs, endTs, new Date(b.start).getTime(), new Date(b.end).getTime()));

      if (conflictingForUser) {
        return res.status(409).json({ error: 'You already have a booking that overlaps this time' });
      }

      // create
      const payload = {
        uid,
        programId,
        start: new Date(startTs).toISOString(),
        end: new Date(endTs).toISOString(),
        status: 'confirmed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection('bookings').add(payload);
      return res.status(200).json({ ok: true, id: docRef.id, ...payload });
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ error: e?.message || 'Server error' });
    }
  })
);
