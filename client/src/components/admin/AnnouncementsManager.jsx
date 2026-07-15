import { useAnnouncements, useToggleAnnouncement, useDeleteAnnouncement } from '../../hooks/useAnnouncements';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';
import { formatDate, categoryLabel } from '../../lib/formatters';
import { useToast } from '../shared/Toast';

export function AnnouncementsManager({ onEdit }) {
  const { data, isLoading, isError, refetch } = useAnnouncements({ admin: true });
  const toggle = useToggleAnnouncement();
  const del = useDeleteAnnouncement();
  const { showToast } = useToast();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data || data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
        No announcements yet.
      </p>
    );
  }

  const handleToggle = async (a) => {
    await toggle.mutateAsync({ id: a.id, active: !a.active });
    showToast(a.active ? 'Announcement hidden.' : 'Announcement published.');
  };

  const handleDelete = async (a) => {
    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return;
    await del.mutateAsync(a.id);
    showToast('Announcement deleted.');
  };

  return (
    <div className="space-y-3">
      {data.map((a) => (
        <div key={a.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            {a.image_url && <img src={a.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />}
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-sage-50 text-sage-700">{categoryLabel(a.category)}</span>
                <span className={`badge ${a.active ? 'bg-sage-100 text-sage-700' : 'bg-ink-100 text-ink-500'}`}>
                  {a.active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <p className="mt-1 font-semibold text-ink-900">{a.title}</p>
              <p className="text-xs text-ink-400">Publishes {formatDate(a.publish_at)}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => onEdit(a)}>
              Edit
            </button>
            <button className="btn-secondary !px-2.5 !py-1.5 text-xs" type="button" onClick={() => handleToggle(a)}>
              {a.active ? 'Hide' : 'Publish'}
            </button>
            <button className="btn-danger !px-2.5 !py-1.5 text-xs" type="button" onClick={() => handleDelete(a)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
