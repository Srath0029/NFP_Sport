// fbfunc/index.js
const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

try { admin.app(); } catch { admin.initializeApp(); }

function setCors(res) {
  res.set({
    'Access-Control-Allow-Origin': '*',               // public read-only
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60',            // cache 60s
  });
}

// GET /public/programs?limit=50&suburb=Footscray
exports.publicPrograms = onRequest(
  { region: 'australia-southeast2', cors: false },
  async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

    try {
      const { limit = '50', suburb } = req.query;
      let ref = admin.firestore().collection('programs');

      // only show active programs (treat missing as active)
      // We can’t query for “missing or true”, so we fetch and filter after if needed.
      const q = suburb ? ref.where('suburb', '==', String(suburb)) : ref;
      const snap = await q.limit(Math.min(parseInt(limit, 10) || 50, 200)).get();

      const programs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.active !== false) // hide inactive
        .map(p => ({
          id: p.id,
          title: p.title || '',
          type: p.type || '',
          days: Array.isArray(p.days) ? p.days : [],
          suburb: p.suburb || '',
          address: p.address || '',
          lat: Number.isFinite(Number(p.lat)) ? Number(p.lat) : null,
          lng: Number.isFinite(Number(p.lng)) ? Number(p.lng) : null,
          capacity: Number.isFinite(Number(p.capacity)) ? Number(p.capacity) : null,
        }));

      return res.json({ ok: true, count: programs.length, programs });
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }
);

// GET /public/program?id=PROGRAM_ID
exports.publicProgram = onRequest(
  { region: 'australia-southeast2', cors: false },
  async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

    try {
      const id = String(req.query.id || '');
      if (!id) return res.status(400).json({ ok: false, error: 'Missing ?id' });

      const doc = await admin.firestore().collection('programs').doc(id).get();
      if (!doc.exists) return res.status(404).json({ ok: false, error: 'Not found' });

      const p = doc.data();
      if (p.active === false) return res.status(404).json({ ok: false, error: 'Not found' });

      const program = {
        id: doc.id,
        title: p.title || '',
        type: p.type || '',
        days: Array.isArray(p.days) ? p.days : [],
        suburb: p.suburb || '',
        address: p.address || '',
        lat: Number.isFinite(Number(p.lat)) ? Number(p.lat) : null,
        lng: Number.isFinite(Number(p.lng)) ? Number(p.lng) : null,
        capacity: Number.isFinite(Number(p.capacity)) ? Number(p.capacity) : null,
        description: p.description || '',
      };

      return res.json({ ok: true, program });
    } catch (e) {
      logger.error(e);
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }
);
