const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole, hashPassword } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  contact_person: z.string().optional(),
  phone: z.string().min(3).optional(),
  address: z.string().optional(),
  monthly_contribution: z.number().nonnegative().optional(),
});

const patchSchema = z.object({
  active: z.boolean().optional(),
  new_password: z.string().min(6).optional(),
});

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  const id = event.queryStringParameters?.id;
  if (!id) throw new HttpError(400, 'Missing household id');

  if (event.httpMethod === 'GET') {
    const rows = await sql`
      SELECT id, name, contact_person, phone, address, monthly_contribution, current_balance,
             next_due_date, notification_prefs, active, created_at
      FROM households WHERE id = ${id}
    `;
    if (!rows[0]) throw new HttpError(404, 'Household not found');
    return ok(rows[0]);
  }

  if (event.httpMethod === 'PUT') {
    const data = parseBody(updateSchema, event);
    const rows = await sql`
      UPDATE households SET
        name = COALESCE(${data.name ?? null}, name),
        contact_person = COALESCE(${data.contact_person ?? null}, contact_person),
        phone = COALESCE(${data.phone ?? null}, phone),
        address = COALESCE(${data.address ?? null}, address),
        monthly_contribution = COALESCE(${data.monthly_contribution ?? null}, monthly_contribution),
        updated_at = now()
      WHERE id = ${id}
      RETURNING id, name, contact_person, phone, address, monthly_contribution, current_balance, next_due_date, active, created_at
    `;
    if (!rows[0]) throw new HttpError(404, 'Household not found');
    return ok(rows[0]);
  }

  if (event.httpMethod === 'PATCH') {
    const data = parseBody(patchSchema, event);

    if (data.active !== undefined) {
      const rows = await sql`
        UPDATE households SET active = ${data.active}, updated_at = now() WHERE id = ${id}
        RETURNING id, name, active
      `;
      if (!rows[0]) throw new HttpError(404, 'Household not found');
      return ok(rows[0]);
    }

    if (data.new_password) {
      const hash = await hashPassword(data.new_password);
      const rows = await sql`
        UPDATE households SET password_hash = ${hash}, updated_at = now() WHERE id = ${id}
        RETURNING id
      `;
      if (!rows[0]) throw new HttpError(404, 'Household not found');
      return ok({ ok: true });
    }

    throw new HttpError(400, 'No changes provided');
  }

  throw new HttpError(405, 'Method not allowed');
});
