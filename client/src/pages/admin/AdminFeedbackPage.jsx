import { useState } from 'react';
import { useAllFeedback, useUpdateFeedback } from '../../hooks/useFeedback';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';
import { formatDate, categoryLabel } from '../../lib/formatters';
import { useToast } from '../../components/shared/Toast';

const STATUS_OPTIONS = ['new', 'reviewed', 'resolved'];
const STATUS_STYLES = {
  new: 'bg-gold-100 text-gold-800',
  reviewed: 'bg-ink-100 text-ink-700',
  resolved: 'bg-sage-100 text-sage-800',
};

export default function AdminFeedbackPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading, isError, refetch } = useAllFeedback(statusFilter ? { status: statusFilter } : {});
  const updateFeedback = useUpdateFeedback();
  const { showToast } = useToast();

  const handleStatusChange = async (id, status) => {
    await updateFeedback.mutateAsync({ id, status });
    showToast('Feedback updated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Feedback &amp; Suggestions</h2>
          <p className="text-sm text-ink-500">Review resident and community feedback.</p>
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={refetch} />}
      {!isLoading && !isError && (!data || data.length === 0) && (
        <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
          No feedback found.
        </p>
      )}
      <div className="space-y-3">
        {(data || []).map((f) => (
          <div key={f.id} className="card p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="badge bg-sage-50 text-sage-700">{categoryLabel(f.category)}</span>
                <span className={`badge ${STATUS_STYLES[f.status] || STATUS_STYLES.new}`}>{f.status}</span>
              </div>
              <select
                className="input w-auto text-xs"
                value={f.status}
                onChange={(e) => handleStatusChange(f.id, e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-sm text-ink-700">{f.message}</p>
            <p className="mt-2 text-xs text-ink-400">
              {f.household_name ? `From: ${f.household_name}` : f.name ? `From: ${f.name}` : 'Anonymous'}
              {f.contact ? ` · ${f.contact}` : ''} · {formatDate(f.created_at)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
