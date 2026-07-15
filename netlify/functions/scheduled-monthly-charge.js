// Netlify scheduled function (see netlify.toml cron "0 0 1 * *") - levies
// each active household's monthly contribution on the 1st of the month.
const { runMonthlyCharge } = require('./_shared/monthlyCharge');

exports.handler = async () => {
  const chargedCount = await runMonthlyCharge();
  console.log(`Monthly charge run complete: ${chargedCount} households charged.`);
  return { statusCode: 200, body: JSON.stringify({ chargedCount }) };
};
