import { formatCurrency, methodLabel, formatDateTime } from '../../lib/formatters';

export function ReconciliationReportView({ report, settings }) {
  return (
    <div id="print-root" className="mx-auto max-w-2xl bg-white p-4 text-ink-900">
      <div className="text-center">
        <p className="text-2xl">🕌</p>
        <h2 className="font-display text-xl font-bold">{settings?.mosque_name}</h2>
      </div>
      <h3 className="mt-4 text-center text-lg font-bold uppercase tracking-wide">
        Monthly Reconciliation — {report.month}/{report.year}
      </h3>
      <p className="text-center text-xs text-ink-400">Generated: {formatDateTime(new Date())}</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-sage-50 p-4">
          <p className="text-xs uppercase text-ink-500">Total Collected</p>
          <p className="text-xl font-bold text-sage-700">{formatCurrency(report.totalCollected)}</p>
        </div>
        <div className="rounded-lg bg-gold-50 p-4">
          <p className="text-xs uppercase text-ink-500">Total Outstanding</p>
          <p className="text-xl font-bold text-gold-700">{formatCurrency(report.totalOutstanding)}</p>
        </div>
      </div>

      <p className="mt-4 text-sm text-ink-600">
        Households Billed: <strong>{report.householdsBilled}</strong> · Households Paid:{' '}
        <strong>{report.householdsPaid}</strong>
      </p>

      <table className="mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink-300 text-left text-xs uppercase text-ink-500">
            <th className="py-2">Payment Method</th>
            <th className="py-2 text-right">Count</th>
            <th className="py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {report.byMethod.map((r) => (
            <tr key={r.method}>
              <td className="py-2">{methodLabel(r.method)}</td>
              <td className="py-2 text-right">{r.count}</td>
              <td className="py-2 text-right">{formatCurrency(r.total)}</td>
            </tr>
          ))}
          {report.byMethod.length === 0 && (
            <tr>
              <td colSpan={3} className="py-4 text-center text-ink-400">
                No payments recorded this month.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="mt-8 text-center font-display text-sm font-bold text-sage-700">Baarak Allaahu Feekum!</p>
      <p className="text-center text-xs text-ink-500">Mosque Management Team</p>
    </div>
  );
}
