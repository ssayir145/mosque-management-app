const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole, hashPassword } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum([ROLES.ADMIN, ROLES.CARETAKER]),
  full_name: z.string().optional(),
});

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);

  if (event.httpMethod === 'GET') {
    const rows = await sql`SELECT id, email, role, full_name, active, created_at FROM users ORDER BY created_at DESC`;
    return ok(rows);
  }

  if (event.httpMethod === 'POST') {
    const data = parseBody(createSchema, event);
    const existing = await sql`SELECT id FROM users WHERE lower(email) = lower(${data.email})`;
    if (existing[0]) throw new HttpError(409, 'A user with this email already exists');
    const passwordHash = await hashPassword(data.password);
    const rows = await sql`
      INSERT INTO users (email, password_hash, role, full_name)
      VALUES (${data.email}, ${passwordHash}, ${data.role}, ${data.full_name ?? null})
      RETURNING id, email, role, full_name, active, created_at
    `;
    return ok(rows[0], 201);
  }

  throw new HttpError(405, 'Method not allowed');
});
