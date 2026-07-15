import { useEffect, useMemo, useState } from 'react';
import { formatTime12h } from '../../lib/formatters';

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhr', label: 'Zuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

function toDateTime(hhmm, base) {
  const [h, m] = String(hhmm).slice(0, 5).split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

export function NextPrayerCountdown({ today, tomorrow }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = useMemo(() => {
    if (today) {
      for (const p of PRAYERS) {
        const time = today[p.key];
        if (!time) continue;
        const dt = toDateTime(time, now);
        if (dt > now) return { ...p, at: dt };
      }
    }
    if (tomorrow?.fajr) {
      const dt = toDateTime(tomorrow.fajr, new Date(now.getTime() + 24 * 60 * 60 * 1000));
      return { key: 'fajr', label: 'Fajr', at: dt };
    }
    return null;
  }, [today, tomorrow, now]);

  if (!next) {
    return (
      <div className="rounded-xl bg-ink-100 px-5 py-4 text-sm text-ink-500">
        Prayer times not yet posted for today.
      </div>
    );
  }

  const diffMs = Math.max(0, next.at - now);
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  const s = Math.floor((diffMs % 60_000) / 1000);
  const timeLabel = today?.[next.key] ? formatTime12h(today[next.key]) : formatTime12h(tomorrow?.[next.key]);

  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-sage-600 px-4 py-4 text-center text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:text-left">
      <div>
        <p className="text-xs uppercase tracking-wide text-sage-100">Next Prayer</p>
        <p className="font-display text-lg font-bold sm:text-xl">
          {next.label} · {timeLabel}
        </p>
      </div>
      <div className="font-mono text-3xl font-semibold tabular-nums sm:text-2xl">
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </div>
    </div>
  );
}
