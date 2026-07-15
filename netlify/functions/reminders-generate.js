const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES } = require('./_shared/constants');

const schema = z.object({
  reminder_type: z.enum(['bulk', 'selective']),
  household_ids: z.array(z.string().uuid()).min(1),
  message_snapshot: z.string().min(1),
  filter_criteria: z.record(z.any()).optional(),
});

exports.handler = withHandler(async (event) => {
  const auth = requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'POST') throw new HttpError(405, 'Method not allowed');
  const data = parseBody(schema, event);
  const filterJson = data.filter_criteria ? JSON.stringify(data.filter_criteria) : null;

  const logRows = await sql`
    INSERT INTO reminder_logs (reminder_type, message_snapshot, filter_criteria, generated_by)
    VALUES (${data.reminder_type}, ${data.message_snapshot}, ${filterJson}::jsonb, ${auth.sub})
    RETURNING id, reminder_type, message_snapshot, filter_criteria, generated_at
  `;
  const log = logRows[0];

  for (const householdId of data.household_ids) {
    await sql`
      INSERT INTO reminder_log_households (reminder_log_id, household_id)
      VALUES (${log.id}, ${householdId})
      ON CONFLICT DO NOTHING
    `;
  }

  return ok({ ...log, household_count: data.household_ids.length }, 201);
});
