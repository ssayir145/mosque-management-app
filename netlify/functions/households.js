const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole, hashPassword } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const createSchema = z.object({
  name: z.string().min(1),
  contact_person: z.string().optional(),
  phone: z.string().min(3),
  address: z.string().optional(),
  password: z.string().min(6),
  monthly_contribution: z.number().nonnegative().default(0),
});

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);

  if (event.httpMethod === 'GET') {
    const search = event.queryStringParameters?.search || null;
    const activeParam = event.queryStringParameters?.active;
    const activeFilter = activeParam === undefined ? null : activeParam === 'true';
    const like = search ? `%${search}%` : null;

    const rows = await sql`
      SELECT id, name, contact_person, phone, address, monthly_contribution, current_balance,
             next_due_date, active, created_at
      FROM households
      WHERE (${like}::text IS NULL OR name ILIKE ${like} OR contact_person ILIKE ${like} OR phone ILIKE ${like})
        AND (${activeFilter}::boolean IS NULL OR active = ${activeFilter})
      ORDER BY name
    `;
    return ok(rows);
  }

  if (event.httpMethod === 'POST') {
    const data = parseBody(createSchema, event);
    const existing = await sql`SELECT id FROM households WHERE phone = ${data.phone}`;
    if (existing[0]) throw new HttpError(409, 'A household with this phone number already exists');

    const passwordHash = await hashPassword(data.password);
    const rows = await sql`
      INSERT INTO households (name, contact_person, phone, address, password_hash, monthly_contribution, next_due_date)
      VALUES (${data.name}, ${data.contact_person ?? null}, ${data.phone}, ${data.address ?? null}, ${passwordHash}, ${data.monthly_contribution}, date_trunc('month', CURRENT_DATE) + interval '1 month')
      RETURNING id, name, contact_person, phone, address, monthly_contribution, current_balance, next_due_date, active, created_at
    `;
    return ok(rows[0], 201);
  }

  throw new HttpError(405, 'Method not allowed');
});
