const { sql } = require('./_shared/db');
const { ok, withHandler, HttpError } = require('./_shared/response');

exports.handler = withHandler(async (event) => {
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');
  const rows = await sql`
    SELECT date, fajr, zuhr, asr, maghrib, isha, notes
    FROM prayer_times
    WHERE date >= CURRENT_DATE AND date < CURRENT_DATE + 7
    ORDER BY date
  `;
  return ok(rows);
});
