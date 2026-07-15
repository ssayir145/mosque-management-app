const { sql } = require('./_shared/db');
const { getAuthUser } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');
  const auth = getAuthUser(event);
  const isMeRoute = event.path.includes('/households/me/');

  let householdId;
  let defaultLimit;
  if (isMeRoute) {
    if (auth.role !== ROLES.RESIDENT) throw new HttpError(403, 'Forbidden');
    householdId = auth.sub;
    defaultLimit = 6;
  } else {
    if (auth.role !== ROLES.ADMIN) throw new HttpError(403, 'Forbidden');
    householdId = event.queryStringParameters?.id;
    defaultLimit = 50;
  }
  if (!householdId) throw new HttpError(400, 'Missing household id');

  const limitParam = event.queryStringParameters?.limit;
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || defaultLimit, 200) : defaultLimit;

  const rows = await sql`
    SELECT id, amount, payment_date, method, notes, previous_balance, new_balance, invoice_number, created_at
    FROM payments
    WHERE household_id = ${householdId}
    ORDER BY payment_date DESC, created_at DESC
    LIMIT ${limit}
  `;
  return ok(rows);
});
