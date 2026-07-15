const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');
  const id = event.queryStringParameters?.id;
  if (!id) throw new HttpError(400, 'Missing payment id');

  const rows = await sql`
    SELECT p.id, p.household_id, p.amount, p.payment_date, p.method, p.notes,
           p.previous_balance, p.new_balance, p.invoice_number, p.created_at,
           h.name AS household_name, h.contact_person, h.phone, h.address
    FROM payments p JOIN households h ON h.id = p.household_id
    WHERE p.id = ${id}
  `;
  if (!rows[0]) throw new HttpError(404, 'Payment not found');
  return ok(rows[0]);
});
