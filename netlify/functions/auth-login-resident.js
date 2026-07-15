const { z } = require('zod');
const { sql } = require('./_shared/db');
const { verifyPassword, signToken } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const schema = z.object({
  phone: z.string().min(3),
  password: z.string().min(1),
});

exports.handler = withHandler(async (event) => {
  if (event.httpMethod !== 'POST') throw new HttpError(405, 'Method not allowed');
  const { phone, password } = parseBody(schema, event);

  const rows = await sql`
    SELECT id, name, contact_person, phone, address, password_hash, monthly_contribution,
           current_balance, next_due_date, notification_prefs, active
    FROM households WHERE phone = ${phone}
  `;
  const household = rows[0];
  if (!household || !household.active) {
    throw new HttpError(401, 'Invalid phone number or password');
  }
  const valid = await verifyPassword(password, household.password_hash);
  if (!valid) {
    throw new HttpError(401, 'Invalid phone number or password');
  }

  const token = signToken({ sub: household.id, role: ROLES.RESIDENT, phone: household.phone, name: household.name });
  delete household.password_hash;

  return ok({ token, household });
});
