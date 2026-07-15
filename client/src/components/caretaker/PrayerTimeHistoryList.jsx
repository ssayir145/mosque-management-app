import { usePrayerTimesHistory } from '../../hooks/usePrayerTimes';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { formatDate, formatTime12h, formatDateTime } from '../../lib/formatters';

function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function PrayerTimeHistoryList({ onEdit }) {
  const { data, isLoading, isError, refetch } = usePrayerTimesHistory({ from: daysAgoStr(6) });

  if (isLoading) return <LoadingSpinner label="Loading history…" />;
  if (isError) return <ErrorState onRetry={refetch} message="Could not load history." />;
  if (!data || data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
        No entries yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((d) => (
        <button
          key={d.date}
          type="button"
          onClick={() => onEdit(d)}
          className="card flex w-full items-center justify-between gap-2 p-4 text-left transition hover:border-sage-300"
        >
          <div>
            <p className="font-semibold text-ink-900">
              {formatDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-xs text-ink-400">Updated {formatDateTime(d.updated_at)}</p>
          </div>
          <div className="text-right text-sm text-ink-600">
            <p>
              Fajr {formatTime12h(d.fajr)} · Isha {formatTime12h(d.isha)}
            </p>
            {d.notes && <p className="text-xs italic text-gold-700">{d.notes}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}
