const { z } = require('zod');
const { sql } = require('./_shared/db');
const { verifyPassword, signToken } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

exports.handler = withHandler(async (event) => {
  if (event.httpMethod !== 'POST') throw new HttpError(405, 'Method not allowed');
  const { email, password } = parseBody(schema, event);

  const rows = await sql`
    SELECT id, email, password_hash, role, full_name, active
    FROM users WHERE lower(email) = lower(${email}) AND role = 'admin'
  `;
  const user = rows[0];
  if (!user || !user.active) {
    throw new HttpError(401, 'Invalid email or password');
  }
  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = signToken({ sub: user.id, role: ROLES.ADMIN, email: user.email, name: user.full_name });
  delete user.password_hash;

  return ok({ token, user });
});
