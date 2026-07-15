const { sql } = require('./_shared/db');
const { ok, withHandler, HttpError } = require('./_shared/response');

exports.handler = withHandler(async (event) => {
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');

  const [todayRows, tomorrowRows] = await Promise.all([
    sql`SELECT date, fajr, zuhr, asr, maghrib, isha, notes FROM prayer_times WHERE date = CURRENT_DATE`,
    sql`SELECT date, fajr, zuhr, asr, maghrib, isha, notes FROM prayer_times WHERE date = CURRENT_DATE + 1`,
  ]);

  return ok({ today: todayRows[0] || null, tomorrow: tomorrowRows[0] || null });
});
