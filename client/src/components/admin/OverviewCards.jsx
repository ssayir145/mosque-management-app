import { usePaymentsSummary } from '../../hooks/usePayments';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { formatCurrency } from '../../lib/formatters';

export function OverviewCards() {
  const { data, isLoading, isError, refetch } = usePaymentsSummary();

  if (isLoading) return <LoadingSpinner label="Loading overview…" />;
  if (isError) return <ErrorState onRetry={refetch} message="Could not load overview." />;

  const cards = [
    { label: 'Total Pending', value: formatCurrency(data.totalPending), accent: 'text-gold-700' },
    { label: 'Households Pending', value: data.householdsPendingCount, accent: 'text-ink-900' },
    { label: 'Average Payment', value: formatCurrency(data.avgPaymentAmount), accent: 'text-ink-900' },
    { label: 'Collection Rate', value: `${data.collectionRatePct}%`, accent: 'text-sage-700' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <p className="text-xs uppercase tracking-wide text-ink-400">{c.label}</p>
          <p className={`mt-2 text-2xl font-bold ${c.accent}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
