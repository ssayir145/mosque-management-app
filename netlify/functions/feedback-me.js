const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  const auth = requireRole(event, [ROLES.RESIDENT]);
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');
  const rows = await sql`
    SELECT id, category, message, status, admin_note, created_at, updated_at
    FROM feedback WHERE household_id = ${auth.sub}
    ORDER BY created_at DESC
  `;
  return ok(rows);
});
