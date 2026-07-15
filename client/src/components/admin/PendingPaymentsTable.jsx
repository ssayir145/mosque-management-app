import { formatCurrency, formatDate } from '../../lib/formatters';

export function PendingPaymentsTable({ households, onMarkPaid, onGenerateInvoice, onSendWhatsApp }) {
  const showActions = !!onMarkPaid;

  if (!households || households.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
        No pending payments. Alhamdulillah!
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="py-2 pr-2">Household</th>
            <th className="px-2 py-2">Phone</th>
            <th className="px-2 py-2 text-right">Pending</th>
            <th className="px-2 py-2 text-right">Days Overdue</th>
            <th className="px-2 py-2">Last Payment</th>
            {showActions && <th className="py-2 pl-2 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {households.map((h) => (
            <tr key={h.household_id}>
              <td className="py-3 pr-2">
                <p className="font-medium text-ink-900">{h.name}</p>
                {h.contact_person && <p className="text-xs text-ink-400">{h.contact_person}</p>}
              </td>
              <td className="px-2 py-3 text-ink-600">{h.phone}</td>
              <td className="px-2 py-3 text-right font-semibold text-gold-700">{formatCurrency(h.pending_amount)}</td>
              <td className="px-2 py-3 text-right">
                <span
                  className={`badge ${
                    h.days_overdue > 30
                      ? 'bg-red-100 text-red-700'
                      : h.days_overdue > 0
                        ? 'bg-gold-100 text-gold-800'
                        : 'bg-sage-100 text-sage-700'
                  }`}
                >
                  {h.days_overdue} day{h.days_overdue === 1 ? '' : 's'}
                </span>
              </td>
              <td className="px-2 py-3 text-ink-500">{h.last_payment_date ? formatDate(h.last_payment_date) : 'Never'}</td>
              {showActions && (
                <td className="py-3 pl-2">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <button className="btn-primary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => onMarkPaid(h)}>
                      Mark as Paid
                    </button>
                    <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => onGenerateInvoice(h)}>
                      Invoice
                    </button>
                    <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => onSendWhatsApp(h)}>
                      WhatsApp
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
