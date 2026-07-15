// Manual trigger for the monthly-charge run, for demos/testing without
// waiting for the scheduled cron.
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { ROLES } = require('./_shared/constants');
const { runMonthlyCharge } = require('./_shared/monthlyCharge');

exports.handler = withHandler(async (event) => {
  requireRole(event, [ROLES.ADMIN]);
  if (event.httpMethod !== 'POST') throw new HttpError(405, 'Method not allowed');
  const chargedCount = await runMonthlyCharge();
  return ok({ chargedCount });
});
