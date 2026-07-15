const { z } = require('zod');
const { sql } = require('./_shared/db');
const { requireRole } = require('./_shared/auth');
const { ok, withHandler, HttpError } = require('./_shared/response');
const { parseBody } = require('./_shared/validate');
const { ROLES, PAYMENT_METHODS, formatInvoiceNumber } = require('./_shared/constants');

const createSchema = z.object({
  household_id: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(PAYMENT_METHODS),
  notes: z.string().optional(),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

exports.handler = withHandler(async (event) => {
  const auth = requireRole(event, [ROLES.ADMIN]);

  if (event.httpMethod === 'GET') {
    const mode = event.queryStringParameters?.mode;

    if (mode === 'pending') {
      const rows = await sql`
        SELECT h.id AS household_id, h.name, h.contact_person, h.phone, h.address,
               h.current_balance AS pending_amount,
               GREATEST(0, (CURRENT_DATE - COALESCE(h.next_due_date, CURRENT_DATE)))::int AS days_overdue,
               (SELECT MAX(payment_date) FROM payments p WHERE p.household_id = h.id) AS last_payment_date
        FROM households h
        WHERE h.active = true AND h.current_balance > 0
        ORDER BY days_overdue DESC, pending_amount DESC
      `;
      return ok(rows);
    }

    if (mode === 'summary') {
      const [balances] = await sql`
        SELECT
          COALESCE(SUM(current_balance) FILTER (WHERE current_balance > 0), 0) AS total_pending,
          COUNT(*) FILTER (WHERE current_balance > 0) AS households_pending_count
        FROM households WHERE active = true
      `;
      const [avgPayment] = await sql`SELECT COALESCE(AVG(amount), 0) AS avg_payment_amount FROM payments`;
      const [collected] = await sql`
        SELECT COALESCE(SUM(amount), 0) AS total FROM payments
        WHERE date_trunc('month', payment_date) = date_trunc('month', CURRENT_DATE)
      `;
      const [charged] = await sql`
        SELECT COALESCE(SUM(amount), 0) AS total FROM charges
        WHERE date_trunc('month', charge_date) = date_trunc('month', CURRENT_DATE)
      `;
      const collectionRatePct = Number(charged.total) > 0 ? (Number(collected.total) / Number(charged.total)) * 100 : 0;

      return ok({
        totalPending: Number(balances.total_pending),
        householdsPendingCount: Number(balances.households_pending_count),
        avgPaymentAmount: Number(avgPayment.avg_payment_amount),
        collectionRatePct: Math.round(collectionRatePct * 100) / 100,
      });
    }

    throw new HttpError(400, 'mode must be "pending" or "summary"');
  }

  if (event.httpMethod === 'POST') {
    const data = parseBody(createSchema, event);

    const household = await sql`SELECT id, name, active FROM households WHERE id = ${data.household_id}`;
    if (!household[0] || !household[0].active) throw new HttpError(404, 'Household not found');

    const [{ nextval }] = await sql`SELECT nextval('invoice_number_seq') AS nextval`;
    const invoiceNumber = formatInvoiceNumber(nextval);
    const paymentDate = data.payment_date || new Date().toISOString().slice(0, 10);

    // Atomic read-and-write: the SET expression reads the row's current value
    // as part of the same UPDATE, avoiding a separate read-then-write race.
    const balanceRows = await sql`
      UPDATE households
      SET current_balance = current_balance - ${data.amount}, updated_at = now()
      WHERE id = ${data.household_id}
      RETURNING current_balance AS new_balance, current_balance + ${data.amount} AS previous_balance
    `;
    const { new_balance, previous_balance } = balanceRows[0];

    const paymentRows = await sql`
      INSERT INTO payments (household_id, amount, payment_date, method, notes, previous_balance, new_balance, invoice_number, recorded_by)
      VALUES (${data.household_id}, ${data.amount}, ${paymentDate}, ${data.method}, ${data.notes ?? null}, ${previous_balance}, ${new_balance}, ${invoiceNumber}, ${auth.sub})
      RETURNING id, household_id, amount, payment_date, method, notes, previous_balance, new_balance, invoice_number, created_at
    `;
    return ok({ ...paymentRows[0], household_name: household[0].name }, 201);
  }

  throw new HttpError(405, 'Method not allowed');
});
