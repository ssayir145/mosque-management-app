import { formatCurrency, formatDate } from '../../lib/formatters';

export function HouseholdsTable({ households, onEdit, onToggleActive, onViewPayments, onResetPassword }) {
  if (!households || households.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
        No households yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-ink-500">
            <th className="py-2 pr-2">Household</th>
            <th className="px-2 py-2">Phone</th>
            <th className="px-2 py-2 text-right">Balance</th>
            <th className="px-2 py-2">Next Due</th>
            <th className="px-2 py-2">Status</th>
            <th className="py-2 pl-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {households.map((h) => (
            <tr key={h.id}>
              <td className="py-3 pr-2">
                <p className="font-medium text-ink-900">{h.name}</p>
                {h.contact_person && <p className="text-xs text-ink-400">{h.contact_person}</p>}
              </td>
              <td className="px-2 py-3 text-ink-600">{h.phone}</td>
              <td
                className={`px-2 py-3 text-right font-semibold ${
                  Number(h.current_balance) > 0 ? 'text-gold-700' : 'text-sage-700'
                }`}
              >
                {formatCurrency(h.current_balance)}
              </td>
              <td className="px-2 py-3 text-ink-500">{formatDate(h.next_due_date)}</td>
              <td className="px-2 py-3">
                <span className={`badge ${h.active ? 'bg-sage-100 text-sage-700' : 'bg-ink-100 text-ink-500'}`}>
                  {h.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="py-3 pl-2">
                <div className="flex flex-wrap justify-end gap-1.5">
                  <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => onViewPayments(h)}>
                    History
                  </button>
                  <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => onEdit(h)}>
                    Edit
                  </button>
                  <button
                    className="btn-secondary !px-2.5 !py-1.5 text-xs"
                    type="button"
                    onClick={() => onResetPassword(h)}
                  >
                    Reset Password
                  </button>
                  <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => onToggleActive(h)}>
                    {h.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
