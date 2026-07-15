import { useMemo, useState } from 'react';
import { useEligibleHouseholds } from '../../hooks/useReminders';
import { useSettings } from '../../hooks/useSettings';
import { ReminderPreviewList } from './ReminderPreviewList';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { formatCurrency } from '../../lib/formatters';

export function SelectiveReminderPanel() {
  const [pendingMin, setPendingMin] = useState('');
  const [daysOverdueMin, setDaysOverdueMin] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());

  const filters = {};
  if (pendingMin) filters.pending_min = pendingMin;
  if (daysOverdueMin) filters.days_overdue_min = daysOverdueMin;

  const { data: eligible, isLoading, isError, refetch } = useEligibleHouseholds(filters);
  const { data: settings } = useSettings({ admin: true });

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedHouseholds = useMemo(
    () => (eligible || []).filter((h) => selectedIds.size === 0 || selectedIds.has(h.household_id)),
    [eligible, selectedIds]
  );

  if (isLoading) return <LoadingSpinner label="Loading households…" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Pending Amount ≥</label>
          <input
            className="input"
            type="number"
            min="0"
            value={pendingMin}
            onChange={(e) => setPendingMin(e.target.value)}
            placeholder="e.g. 500"
          />
        </div>
        <div>
          <label className="label">Days Overdue ≥</label>
          <input
            className="input"
            type="number"
            min="0"
            value={daysOverdueMin}
            onChange={(e) => setDaysOverdueMin(e.target.value)}
            placeholder="e.g. 15"
          />
        </div>
      </div>

      <div>
        <p className="label">
          Households ({eligible?.length || 0} match filters — select specific ones, or leave unselected to include
          all)
        </p>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border border-ink-200 p-2">
          {(eligible || []).map((h) => (
            <label
              key={h.household_id}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-sage-50"
            >
              <input
                type="checkbox"
                checked={selectedIds.has(h.household_id)}
                onChange={() => toggleSelected(h.household_id)}
              />
              <span className="flex-1">{h.name}</span>
              <span className="text-ink-400">
                {formatCurrency(h.pending_amount)} · {h.days_overdue}d
              </span>
            </label>
          ))}
          {(!eligible || eligible.length === 0) && (
            <p className="p-2 text-sm text-ink-400">No households match these filters.</p>
          )}
        </div>
      </div>

      <ReminderPreviewList
        households={selectedHouseholds}
        template={settings?.message_templates?.selective_reminder || ''}
        mosquePhone={settings?.phone}
        reminderType="selective"
        filterCriteria={{
          pending_min: pendingMin || null,
          days_overdue_min: daysOverdueMin || null,
          selected_ids: [...selectedIds],
        }}
      />
    </div>
  );
}
