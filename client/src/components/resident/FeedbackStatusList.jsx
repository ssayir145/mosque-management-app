import { useMyFeedback } from '../../hooks/useFeedback';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { formatDate, categoryLabel } from '../../lib/formatters';

const STATUS_STYLES = {
  new: 'bg-gold-100 text-gold-800',
  reviewed: 'bg-ink-100 text-ink-700',
  resolved: 'bg-sage-100 text-sage-800',
};

export function FeedbackStatusList() {
  const { data, isLoading, isError, refetch } = useMyFeedback();

  if (isLoading) return <LoadingSpinner label="Loading your feedback…" />;
  if (isError) return <ErrorState onRetry={refetch} message="Could not load your feedback." />;
  if (!data || data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
        You haven&apos;t submitted any feedback yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((f) => (
        <div key={f.id} className="card p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="badge bg-sage-50 text-sage-700">{categoryLabel(f.category)}</span>
            <span className={`badge ${STATUS_STYLES[f.status] || STATUS_STYLES.new}`}>{f.status}</span>
          </div>
          <p className="text-sm text-ink-700">{f.message}</p>
          {f.admin_note && (
            <p className="mt-2 rounded-lg bg-ink-50 p-2 text-xs text-ink-600">
              <strong>Committee note:</strong> {f.admin_note}
            </p>
          )}
          <p className="mt-2 text-xs text-ink-400">Submitted {formatDate(f.created_at)}</p>
        </div>
      ))}
    </div>
  );
}
