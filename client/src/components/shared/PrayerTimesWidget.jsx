import { usePrayerTimesToday } from '../../hooks/usePrayerTimes';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorState } from './ErrorState';
import { NextPrayerCountdown } from './NextPrayerCountdown';
import { formatTime12h } from '../../lib/formatters';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhr', label: 'Zuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

export function PrayerTimesWidget() {
  const { data, isLoading, isError, refetch } = usePrayerTimesToday();

  if (isLoading) return <LoadingSpinner label="Loading prayer times…" />;
  if (isError) return <ErrorState onRetry={refetch} message="Could not load prayer times." />;

  return (
    <div className="card geo-border p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">Today&apos;s Prayer Times</h3>
      <NextPrayerCountdown today={data?.today} tomorrow={data?.tomorrow} />
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {PRAYERS.map((p) => (
          <div key={p.key} className="rounded-lg bg-sage-50 px-1.5 py-2.5 text-center sm:px-2 sm:py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-sage-700 sm:text-[11px]">{p.label}</p>
            <p className="mt-1 text-xs font-semibold text-ink-900 sm:text-sm">{formatTime12h(data?.today?.[p.key])}</p>
          </div>
        ))}
      </div>
      {data?.today?.notes && <p className="mt-3 text-xs italic text-gold-700">{data.today.notes}</p>}
      {!data?.today && (
        <p className="mt-3 text-xs text-ink-500">The caretaker hasn&apos;t posted today&apos;s timings yet.</p>
      )}
    </div>
  );
}
