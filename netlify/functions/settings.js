const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const updateSchema = z.object({
  mosque_name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  logo_url: z.string().optional(),
  message_templates: z.record(z.string()).optional(),
});

exports.handler = withHandler(async (event) => {
  if (event.httpMethod === 'GET') {
    const isAdmin = event.queryStringParameters?.admin === '1';
    if (isAdmin) {
      requireRole(event, [ROLES.ADMIN]);
      const rows = await sql`SELECT * FROM settings WHERE id = 1`;
      return ok(rows[0]);
    }
    const rows = await sql`SELECT mosque_name, address, phone, email, logo_url FROM settings WHERE id = 1`;
    return ok(rows[0]);
  }

  if (event.httpMethod === 'PUT') {
    requireRole(event, [ROLES.ADMIN]);
    const data = parseBody(updateSchema, event);
    const templatesJson = data.message_templates ? JSON.stringify(data.message_templates) : null;
    const rows = await sql`
      UPDATE settings SET
        mosque_name = COALESCE(${data.mosque_name ?? null}, mosque_name),
        address = COALESCE(${data.address ?? null}, address),
        phone = COALESCE(${data.phone ?? null}, phone),
        email = COALESCE(${data.email ?? null}, email),
        logo_url = COALESCE(${data.logo_url ?? null}, logo_url),
        message_templates = COALESCE(${templatesJson}::jsonb, message_templates),
        updated_at = now()
      WHERE id = 1
      RETURNING *
    `;
    return ok(rows[0]);
  }

  throw new HttpError(405, 'Method not allowed');
});
