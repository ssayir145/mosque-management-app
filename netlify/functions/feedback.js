const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole, getAuthUserOptional } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES, FEEDBACK_CATEGORIES } = require('./_shared/constants');

const createSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  message: z.string().min(1),
  name: z.string().optional(),
  contact: z.string().optional(),
});

exports.handler = withHandler(async (event) => {
  if (event.httpMethod === 'POST') {
    const data = parseBody(createSchema, event);
    const auth = getAuthUserOptional(event);
    const householdId = auth && auth.role === ROLES.RESIDENT ? auth.sub : null;
    const rows = await sql`
      INSERT INTO feedback (household_id, category, message, name, contact)
      VALUES (${householdId}, ${data.category}, ${data.message}, ${data.name ?? null}, ${data.contact ?? null})
      RETURNING id, category, message, status, created_at
    `;
    return ok(rows[0], 201);
  }

  if (event.httpMethod === 'GET') {
    requireRole(event, [ROLES.ADMIN]);
    const status = event.queryStringParameters?.status || null;
    const category = event.queryStringParameters?.category || null;
    const rows = await sql`
      SELECT f.id, f.household_id, h.name AS household_name, f.category, f.message, f.name, f.contact,
             f.status, f.admin_note, f.created_at, f.updated_at
      FROM feedback f
      LEFT JOIN households h ON h.id = f.household_id
      WHERE (${status}::text IS NULL OR f.status = ${status})
        AND (${category}::text IS NULL OR f.category = ${category})
      ORDER BY f.created_at DESC
      LIMIT 200
    `;
    return ok(rows);
  }

  throw new HttpError(405, 'Method not allowed');
});
