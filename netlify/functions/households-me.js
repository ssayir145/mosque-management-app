const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole, hashPassword, verifyPassword } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const updateSchema = z.object({
  contact_person: z.string().optional(),
  address: z.string().optional(),
  notification_prefs: z.record(z.any()).optional(),
});

const passwordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(6),
});

exports.handler = withHandler(async (event) => {
  const auth = requireRole(event, [ROLES.RESIDENT]);
  const isPasswordRoute = event.path.endsWith('/password');

  if (isPasswordRoute) {
    if (event.httpMethod !== 'PUT') throw new HttpError(405, 'Method not allowed');
    const { current_password, new_password } = parseBody(passwordSchema, event);
    const rows = await sql`SELECT password_hash FROM households WHERE id = ${auth.sub}`;
    if (!rows[0]) throw new HttpError(404, 'Household not found');
    const valid = await verifyPassword(current_password, rows[0].password_hash);
    if (!valid) throw new HttpError(401, 'Current password is incorrect');
    const hash = await hashPassword(new_password);
    await sql`UPDATE households SET password_hash = ${hash}, updated_at = now() WHERE id = ${auth.sub}`;
    return ok({ ok: true });
  }

  if (event.httpMethod === 'GET') {
    const rows = await sql`
      SELECT id, name, contact_person, phone, address, monthly_contribution, current_balance,
             next_due_date, notification_prefs, active
      FROM households WHERE id = ${auth.sub}
    `;
    if (!rows[0]) throw new HttpError(404, 'Household not found');
    return ok(rows[0]);
  }

  if (event.httpMethod === 'PUT') {
    const data = parseBody(updateSchema, event);
    const prefsJson = data.notification_prefs ? JSON.stringify(data.notification_prefs) : null;
    const rows = await sql`
      UPDATE households SET
        contact_person = COALESCE(${data.contact_person ?? null}, contact_person),
        address = COALESCE(${data.address ?? null}, address),
        notification_prefs = COALESCE(${prefsJson}::jsonb, notification_prefs),
        updated_at = now()
      WHERE id = ${auth.sub}
      RETURNING id, name, contact_person, phone, address, monthly_contribution, current_balance, next_due_date, notification_prefs, active
    `;
    return ok(rows[0]);
  }

  throw new HttpError(405, 'Method not allowed');
});
