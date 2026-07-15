import { formatCurrency, formatDate, methodLabel } from '../../lib/formatters';

export function PaymentHistoryTable({ payments }) {
  if (!payments || payments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
        No payment history yet.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="py-2 pr-2">Date</th>
            <th className="px-2 py-2">Amount</th>
            <th className="px-2 py-2">Method</th>
            <th className="px-2 py-2">Invoice #</th>
            <th className="py-2 pl-2 text-right">Balance After</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="py-2 pr-2 font-medium text-ink-800">{formatDate(p.payment_date)}</td>
              <td className="px-2 py-2">{formatCurrency(p.amount)}</td>
              <td className="px-2 py-2">{methodLabel(p.method)}</td>
              <td className="px-2 py-2 text-ink-500">{p.invoice_number}</td>
              <td className="py-2 pl-2 text-right">{formatCurrency(p.new_balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
