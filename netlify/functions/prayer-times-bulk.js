const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be HH:MM');
const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fajr: timeSchema,
  zuhr: timeSchema,
  asr: timeSchema,
  maghrib: timeSchema,
  isha: timeSchema,
  notes: z.string().optional(),
});
const bulkSchema = z.object({ entries: z.array(entrySchema).min(1).max(62) });

exports.handler = withHandler(async (event) => {
  const auth = requireRole(event, [ROLES.CARETAKER, ROLES.ADMIN]);
  if (event.httpMethod !== 'POST') throw new HttpError(405, 'Method not allowed');
  const { entries } = parseBody(bulkSchema, event);

  let savedCount = 0;
  for (const e of entries) {
    await sql`
      INSERT INTO prayer_times (date, fajr, zuhr, asr, maghrib, isha, notes, updated_by)
      VALUES (${e.date}, ${e.fajr}, ${e.zuhr}, ${e.asr}, ${e.maghrib}, ${e.isha}, ${e.notes ?? null}, ${auth.sub})
      ON CONFLICT (date) DO UPDATE SET
        fajr = EXCLUDED.fajr, zuhr = EXCLUDED.zuhr, asr = EXCLUDED.asr,
        maghrib = EXCLUDED.maghrib, isha = EXCLUDED.isha, notes = EXCLUDED.notes,
        updated_by = EXCLUDED.updated_by, updated_at = now()
    `;
    savedCount++;
  }
  return ok({ savedCount });
});
