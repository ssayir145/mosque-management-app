import { useAnnouncements } from '../../hooks/useAnnouncements';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorState } from './ErrorState';
import { AnnouncementCard } from './AnnouncementCard';

export function AnnouncementsFeed() {
  const { data, isLoading, isError, refetch } = useAnnouncements();

  if (isLoading) return <LoadingSpinner label="Loading announcements…" />;
  if (isError) return <ErrorState onRetry={refetch} message="Could not load announcements." />;
  if (!data || data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
        No announcements yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {data.map((a) => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
    </div>
  );
}
