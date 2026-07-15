const { sql } = require('./db');

// Levies each active household's monthly_contribution as a new charge and
// rolls current_balance/next_due_date forward. Shared by the scheduled
// function (runs on the 1st of each month) and the admin manual-trigger endpoint.
async function runMonthlyCharge() {
  const households = await sql`
    SELECT id, monthly_contribution FROM households WHERE active = true AND monthly_contribution > 0
  `;

  let chargedCount = 0;
  for (const h of households) {
    await sql`
      INSERT INTO charges (household_id, amount, charge_date) VALUES (${h.id}, ${h.monthly_contribution}, CURRENT_DATE)
    `;
    await sql`
      UPDATE households
      SET current_balance = current_balance + ${h.monthly_contribution},
          next_due_date = COALESCE(next_due_date, CURRENT_DATE) + interval '1 month',
          updated_at = now()
      WHERE id = ${h.id}
    `;
    chargedCount++;
  }
  return chargedCount;
}

module.exports = { runMonthlyCharge };
