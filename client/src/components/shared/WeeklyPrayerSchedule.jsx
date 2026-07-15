import { usePrayerTimesWeek } from '../../hooks/usePrayerTimes';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorState } from './ErrorState';
import { formatDate, formatTime12h } from '../../lib/formatters';

export function WeeklyPrayerSchedule() {
  const { data, isLoading, isError, refetch } = usePrayerTimesWeek();

  if (isLoading) return <LoadingSpinner label="Loading weekly schedule…" />;
  if (isError) return <ErrorState onRetry={refetch} message="Could not load the weekly schedule." />;

  return (
    <div className="card p-5">
      <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">This Week</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="py-2 pr-2">Date</th>
              <th className="px-2 py-2">Fajr</th>
              <th className="px-2 py-2">Zuhr</th>
              <th className="px-2 py-2">Asr</th>
              <th className="px-2 py-2">Maghrib</th>
              <th className="py-2 pl-2">Isha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {(data || []).map((d) => (
              <tr key={d.date}>
                <td className="py-2 pr-2 font-medium text-ink-800">
                  {formatDate(d.date, { weekday: 'short', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-2 py-2">{formatTime12h(d.fajr)}</td>
                <td className="px-2 py-2">{formatTime12h(d.zuhr)}</td>
                <td className="px-2 py-2">{formatTime12h(d.asr)}</td>
                <td className="px-2 py-2">{formatTime12h(d.maghrib)}</td>
                <td className="py-2 pl-2">{formatTime12h(d.isha)}</td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-ink-400">
                  No schedule posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
