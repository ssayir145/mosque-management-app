const { sql } = require('./_shared/db');
const { getAuthUser } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');
  const auth = getAuthUser(event);

  if (auth.role === ROLES.RESIDENT) {
    const rows = await sql`
      SELECT id, name, contact_person, phone, address, monthly_contribution,
             current_balance, next_due_date, notification_prefs, active
      FROM households WHERE id = ${auth.sub}
    `;
    if (!rows[0] || !rows[0].active) throw new HttpError(401, 'Session no longer valid');
    return ok({ role: auth.role, profile: rows[0] });
  }

  const rows = await sql`
    SELECT id, email, role, full_name, active FROM users WHERE id = ${auth.sub} AND role = ${auth.role}
  `;
  if (!rows[0] || !rows[0].active) throw new HttpError(401, 'Session no longer valid');
  return ok({ role: auth.role, profile: rows[0] });
});
