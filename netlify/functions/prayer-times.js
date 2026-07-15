const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM');

const upsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fajr: timeSchema,
  zuhr: timeSchema,
  asr: timeSchema,
  maghrib: timeSchema,
  isha: timeSchema,
  notes: z.string().optional(),
});

exports.handler = withHandler(async (event) => {
  const auth = requireRole(event, [ROLES.CARETAKER, ROLES.ADMIN]);

  if (event.httpMethod === 'GET') {
    const from = event.queryStringParameters?.from || null;
    const to = event.queryStringParameters?.to || null;
    const rows = await sql`
      SELECT id, date, fajr, zuhr, asr, maghrib, isha, notes, updated_at
      FROM prayer_times
      WHERE (${from}::date IS NULL OR date >= ${from}::date)
        AND (${to}::date IS NULL OR date <= ${to}::date)
      ORDER BY date DESC
      LIMIT 100
    `;
    return ok(rows);
  }

  if (event.httpMethod === 'POST') {
    const data = parseBody(upsertSchema, event);
    const rows = await sql`
      INSERT INTO prayer_times (date, fajr, zuhr, asr, maghrib, isha, notes, updated_by)
      VALUES (${data.date}, ${data.fajr}, ${data.zuhr}, ${data.asr}, ${data.maghrib}, ${data.isha}, ${data.notes ?? null}, ${auth.sub})
      ON CONFLICT (date) DO UPDATE SET
        fajr = EXCLUDED.fajr, zuhr = EXCLUDED.zuhr, asr = EXCLUDED.asr,
        maghrib = EXCLUDED.maghrib, isha = EXCLUDED.isha, notes = EXCLUDED.notes,
        updated_by = EXCLUDED.updated_by, updated_at = now()
      RETURNING id, date, fajr, zuhr, asr, maghrib, isha, notes, updated_at
    `;
    return ok(rows[0], 201);
  }

  throw new HttpError(405, 'Method not allowed');
});
