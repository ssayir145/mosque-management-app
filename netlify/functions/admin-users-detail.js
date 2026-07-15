const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole, hashPassword } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const patchSchema = z.object({
  active: z.boolean().optional(),
  full_name: z.string().optional(),
  new_password: z.string().min(6).optional(),
});

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'PATCH') throw new HttpError(405, 'Method not allowed');
  const id = event.queryStringParameters?.id;
  if (!id) throw new HttpError(400, 'Missing user id');
  const data = parseBody(patchSchema, event);
  const passwordHash = data.new_password ? await hashPassword(data.new_password) : null;

  const rows = await sql`
    UPDATE users SET
      active = COALESCE(${data.active ?? null}, active),
      full_name = COALESCE(${data.full_name ?? null}, full_name),
      password_hash = COALESCE(${passwordHash}, password_hash),
      updated_at = now()
    WHERE id = ${id}
    RETURNING id, email, role, full_name, active, created_at
  `;
  if (!rows[0]) throw new HttpError(404, 'User not found');
  return ok(rows[0]);
});
