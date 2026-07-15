const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');

  const now = new Date();
  const year = Number(event.queryStringParameters?.year) || now.getFullYear();
  const month = Number(event.queryStringParameters?.month) || now.getMonth() + 1;
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;

  const [{ total_collected }] = await sql`
    SELECT COALESCE(SUM(amount), 0) AS total_collected FROM payments
    WHERE payment_date >= ${monthStart}::date AND payment_date < (${monthStart}::date + interval '1 month')
  `;
  const byMethod = await sql`
    SELECT method, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM payments
    WHERE payment_date >= ${monthStart}::date AND payment_date < (${monthStart}::date + interval '1 month')
    GROUP BY method ORDER BY total DESC
  `;
  const [{ total_outstanding }] = await sql`
    SELECT COALESCE(SUM(current_balance), 0) AS total_outstanding FROM households WHERE active = true AND current_balance > 0
  `;
  const [{ households_billed }] = await sql`
    SELECT COUNT(DISTINCT household_id) AS households_billed FROM charges
    WHERE charge_date >= ${monthStart}::date AND charge_date < (${monthStart}::date + interval '1 month')
  `;
  const [{ households_paid }] = await sql`
    SELECT COUNT(DISTINCT household_id) AS households_paid FROM payments
    WHERE payment_date >= ${monthStart}::date AND payment_date < (${monthStart}::date + interval '1 month')
  `;

  return ok({
    month,
    year,
    totalCollected: Number(total_collected),
    byMethod: byMethod.map((r) => ({ method: r.method, total: Number(r.total), count: Number(r.count) })),
    totalOutstanding: Number(total_outstanding),
    householdsBilled: Number(households_billed),
    householdsPaid: Number(households_paid),
  });
});
