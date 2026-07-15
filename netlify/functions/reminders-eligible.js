const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');

  const pendingMinParam = event.queryStringParameters?.pending_min;
  const daysOverdueMinParam = event.queryStringParameters?.days_overdue_min;
  const pendingMin = pendingMinParam ? Number(pendingMinParam) : null;
  const daysOverdueMin = daysOverdueMinParam ? Number(daysOverdueMinParam) : null;

  const rows = await sql`
    SELECT h.id AS household_id, h.name, h.contact_person, h.phone,
           h.current_balance AS pending_amount,
           GREATEST(0, (CURRENT_DATE - COALESCE(h.next_due_date, CURRENT_DATE)))::int AS days_overdue
    FROM households h
    WHERE h.active = true AND h.current_balance > 0
      AND (${pendingMin}::numeric IS NULL OR h.current_balance >= ${pendingMin})
      AND (${daysOverdueMin}::int IS NULL OR GREATEST(0, (CURRENT_DATE - COALESCE(h.next_due_date, CURRENT_DATE))) >= ${daysOverdueMin})
    ORDER BY days_overdue DESC
  `;
  return ok(rows);
});
