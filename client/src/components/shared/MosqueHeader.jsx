import { useSettings } from '../../hooks/useSettings';
import { formatDate } from '../../lib/formatters';
import { formatHijriDate } from '../../lib/hijriDate';

export function MosqueHeader({ children }) {
  const { data } = useSettings();
  const now = new Date();

  return (
    <header className="geo-border relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-sage-700 via-sage-600 to-sage-800 px-4 py-6 text-white shadow-md sm:px-8">
      <div className="absolute inset-0 bg-geo-pattern opacity-20" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl ring-1 ring-white/30 backdrop-blur-sm">
            🕌
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
              {data?.mosque_name || 'Mosque'}
            </h1>
            {data?.address && <p className="text-xs text-sage-100">{data.address}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-white/10 px-4 py-2 text-right backdrop-blur-sm">
            <p className="text-sm font-medium">
              {formatDate(now, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xs text-gold-200">{formatHijriDate(now)}</p>
          </div>
          {children}
        </div>
      </div>
    </header>
  );
}
