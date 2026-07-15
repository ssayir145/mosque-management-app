import { formatDate, categoryLabel } from '../../lib/formatters';

const CATEGORY_STYLES = {
  event: 'bg-gold-100 text-gold-800',
  maintenance: 'bg-ink-100 text-ink-700',
  fund: 'bg-sage-100 text-sage-800',
  general: 'bg-sage-50 text-sage-700',
};

export function AnnouncementCard({ announcement }) {
  return (
    <article className="card overflow-hidden">
      {announcement.image_url && (
        <img src={announcement.image_url} alt="" className="h-40 w-full object-cover" />
      )}
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={`badge ${CATEGORY_STYLES[announcement.category] || CATEGORY_STYLES.general}`}>
            {categoryLabel(announcement.category)}
          </span>
          <span className="text-xs text-ink-400">{formatDate(announcement.publish_at)}</span>
        </div>
        <h4 className="font-display text-lg font-semibold text-ink-900">{announcement.title}</h4>
        <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{announcement.content}</p>
      </div>
    </article>
  );
}
