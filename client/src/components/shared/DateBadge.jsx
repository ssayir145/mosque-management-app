import { formatDate } from '../../lib/formatters';
import { formatHijriDate } from '../../lib/hijriDate';

export function DateBadge() {
  const now = new Date();
  return (
    <div className="text-right">
      <div className="text-sm font-medium text-ink-700">
        {formatDate(now, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
      <div className="text-xs font-medium text-gold-700">{formatHijriDate(now)}</div>
    </div>
  );
}
