const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES, ANNOUNCEMENT_CATEGORIES } = require('./_shared/constants');

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  image_url: z.string().optional(),
  category: z.enum(ANNOUNCEMENT_CATEGORIES).optional(),
  publish_at: z.string().optional(),
});

const patchSchema = z.object({
  active: z.boolean(),
});

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  const id = event.queryStringParameters?.id;
  if (!id) throw new HttpError(400, 'Missing announcement id');

  if (event.httpMethod === 'PUT') {
    const data = parseBody(updateSchema, event);
    const rows = await sql`
      UPDATE announcements SET
        title = COALESCE(${data.title ?? null}, title),
        content = COALESCE(${data.content ?? null}, content),
        image_url = COALESCE(${data.image_url ?? null}, image_url),
        category = COALESCE(${data.category ?? null}, category),
        publish_at = COALESCE(${data.publish_at ?? null}, publish_at),
        updated_at = now()
      WHERE id = ${id}
      RETURNING id, title, content, image_url, category, active, publish_at, created_at, updated_at
    `;
    if (!rows[0]) throw new HttpError(404, 'Announcement not found');
    return ok(rows[0]);
  }

  if (event.httpMethod === 'PATCH') {
    const { active } = parseBody(patchSchema, event);
    const rows = await sql`
      UPDATE announcements SET active = ${active}, updated_at = now() WHERE id = ${id}
      RETURNING id, active
    `;
    if (!rows[0]) throw new HttpError(404, 'Announcement not found');
    return ok(rows[0]);
  }

  if (event.httpMethod === 'DELETE') {
    const rows = await sql`DELETE FROM announcements WHERE id = ${id} RETURNING id`;
    if (!rows[0]) throw new HttpError(404, 'Announcement not found');
    return ok({ ok: true });
  }

  throw new HttpError(405, 'Method not allowed');
});
