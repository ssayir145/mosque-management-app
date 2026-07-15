import { formatCurrency, formatDate } from '../../lib/formatters';

export function HouseholdSummaryCard({ household }) {
  const pending = Number(household?.current_balance || 0);
  return (
    <div className="card geo-border grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-400">Pending Amount</p>
        <p className={`mt-1 text-2xl font-bold ${pending > 0 ? 'text-gold-700' : 'text-sage-700'}`}>
          {formatCurrency(pending)}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-400">Next Due Date</p>
        <p className="mt-1 text-2xl font-bold text-ink-900">{formatDate(household?.next_due_date)}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-ink-400">Monthly Contribution</p>
        <p className="mt-1 text-2xl font-bold text-ink-900">{formatCurrency(household?.monthly_contribution)}</p>
      </div>
    </div>
  );
}
