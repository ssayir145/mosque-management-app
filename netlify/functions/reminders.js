const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'GET') throw new HttpError(405, 'Method not allowed');
  const limitParam = event.queryStringParameters?.limit;
  const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 200) : 50;

  const rows = await sql`
    SELECT rl.id, rl.reminder_type, rl.message_snapshot, rl.filter_criteria, rl.generated_at,
           u.full_name AS generated_by_name,
           (SELECT COUNT(*) FROM reminder_log_households rlh WHERE rlh.reminder_log_id = rl.id) AS household_count
    FROM reminder_logs rl
    LEFT JOIN users u ON u.id = rl.generated_by
    ORDER BY rl.generated_at DESC
    LIMIT ${limit}
  `;
  return ok(rows);
});
