const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES, FEEDBACK_STATUSES } = require('./_shared/constants');

const patchSchema = z.object({
  status: z.enum(FEEDBACK_STATUSES).optional(),
  admin_note: z.string().optional(),
});

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'PATCH') throw new HttpError(405, 'Method not allowed');
  const id = event.queryStringParameters?.id;
  if (!id) throw new HttpError(400, 'Missing feedback id');
  const data = parseBody(patchSchema, event);

  const rows = await sql`
    UPDATE feedback SET
      status = COALESCE(${data.status ?? null}, status),
      admin_note = COALESCE(${data.admin_note ?? null}, admin_note),
      updated_at = now()
    WHERE id = ${id}
    RETURNING id, category, message, status, admin_note, updated_at
  `;
  if (!rows[0]) throw new HttpError(404, 'Feedback not found');
  return ok(rows[0]);
});
