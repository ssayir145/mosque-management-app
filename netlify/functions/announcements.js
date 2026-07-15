const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES, ANNOUNCEMENT_CATEGORIES } = require('./_shared/constants');

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  image_url: z.string().optional(),
  category: z.enum(ANNOUNCEMENT_CATEGORIES),
  active: z.boolean().optional().default(true),
  publish_at: z.string().optional(),
});

exports.handler = withHandler(async (event) => {
  if (event.httpMethod === 'GET') {
    const isAdmin = event.queryStringParameters?.admin === '1';
    const category = event.queryStringParameters?.category || null;

    if (isAdmin) {
      requireRole(event, [ROLES.ADMIN]);
      const rows = await sql`
        SELECT id, title, content, image_url, category, active, publish_at, created_at, updated_at
        FROM announcements
        WHERE (${category}::text IS NULL OR category = ${category})
        ORDER BY publish_at DESC
      `;
      return ok(rows);
    }

    const rows = await sql`
      SELECT id, title, content, image_url, category, publish_at, created_at
      FROM announcements
      WHERE active = true AND publish_at <= now()
        AND (${category}::text IS NULL OR category = ${category})
      ORDER BY publish_at DESC
      LIMIT 50
    `;
    return ok(rows);
  }

  if (event.httpMethod === 'POST') {
    const auth = requireRole(event, [ROLES.ADMIN]);
    const data = parseBody(createSchema, event);
    const rows = await sql`
      INSERT INTO announcements (title, content, image_url, category, active, publish_at, created_by)
      VALUES (${data.title}, ${data.content}, ${data.image_url ?? null}, ${data.category}, ${data.active}, ${data.publish_at ?? new Date().toISOString()}, ${auth.sub})
      RETURNING id, title, content, image_url, category, active, publish_at, created_at, updated_at
    `;
    return ok(rows[0], 201);
  }

  throw new HttpError(405, 'Method not allowed');
});
