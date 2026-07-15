import { formatCurrency, formatDate, formatDateTime } from '../../lib/formatters';

export function PendingReportView({ report, settings }) {
  return (
    <div id="print-root" className="mx-auto max-w-3xl bg-white p-4 text-ink-900">
      <div className="text-center">
        <p className="text-2xl">🕌</p>
        <h2 className="font-display text-xl font-bold">{settings?.mosque_name}</h2>
        {settings?.address && <p className="text-xs text-ink-500">{settings.address}</p>}
      </div>
      <h3 className="mt-4 text-center text-lg font-bold uppercase tracking-wide">Pending Payments Report</h3>
      <p className="text-center text-xs text-ink-400">Generated: {formatDateTime(report.generatedAt)}</p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink-300 text-left text-xs uppercase text-ink-500">
            <th className="py-2">Household</th>
            <th className="py-2">Contact</th>
            <th className="py-2">Phone</th>
            <th className="py-2 text-right">Pending</th>
            <th className="py-2 text-right">Days Overdue</th>
            <th className="py-2">Last Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {report.households.map((h) => (
            <tr key={h.household_id}>
              <td className="py-2">{h.name}</td>
              <td className="py-2">{h.contact_person || '—'}</td>
              <td className="py-2">{h.phone}</td>
              <td className="py-2 text-right">{formatCurrency(h.pending_amount)}</td>
              <td className="py-2 text-right">{h.days_overdue}</td>
              <td className="py-2">{h.last_payment_date ? formatDate(h.last_payment_date) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <div className="rounded-lg border border-sage-300 bg-sage-50 px-4 py-3 text-right">
          <p className="text-xs uppercase text-ink-500">Total Pending</p>
          <p className="text-xl font-bold text-gold-700">{formatCurrency(report.totalPending)}</p>
          <p className="text-xs text-ink-400">{report.count} household(s)</p>
        </div>
      </div>

      <p className="mt-8 text-center font-display text-sm font-bold text-sage-700">Baarak Allaahu Feekum!</p>
      <p className="text-center text-xs text-ink-500">Mosque Management Team</p>
    </div>
  );
}
