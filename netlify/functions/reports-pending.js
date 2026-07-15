const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');

  const households = await sql`
    SELECT h.id AS household_id, h.name, h.contact_person, h.phone, h.address,
           h.current_balance AS pending_amount,
           GREATEST(0, (CURRENT_DATE - COALESCE(h.next_due_date, CURRENT_DATE)))::int AS days_overdue,
           (SELECT MAX(payment_date) FROM payments p WHERE p.household_id = h.id) AS last_payment_date
    FROM households h
    WHERE h.active = true AND h.current_balance > 0
    ORDER BY days_overdue DESC, pending_amount DESC
  `;
  const totalPending = households.reduce((sum, h) => sum + Number(h.pending_amount), 0);
  return ok({ households, totalPending, count: households.length, generatedAt: new Date().toISOString() });
});
