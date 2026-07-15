import { useEffect, useState } from 'react';
import { useSavePrayerTime } from '../../hooks/usePrayerTimes';
import { useToast } from '../shared/Toast';

const FIELDS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhr', label: 'Zuhr' },
  { key: 'asr', label: 'Asr' },
  { key: 'maghrib', label: 'Maghrib' },
  { key: 'isha', label: 'Isha' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export function PrayerTimeForm({ initial, onSaved }) {
  const [date, setDate] = useState(initial?.date?.slice(0, 10) || todayStr());
  const [times, setTimes] = useState({
    fajr: initial?.fajr?.slice(0, 5) || '',
    zuhr: initial?.zuhr?.slice(0, 5) || '',
    asr: initial?.asr?.slice(0, 5) || '',
    maghrib: initial?.maghrib?.slice(0, 5) || '',
    isha: initial?.isha?.slice(0, 5) || '',
  });
  const [notes, setNotes] = useState(initial?.notes || '');
  const save = useSavePrayerTime();
  const { showToast } = useToast();

  useEffect(() => {
    if (initial) {
      setDate(initial.date?.slice(0, 10) || todayStr());
      setTimes({
        fajr: initial.fajr?.slice(0, 5) || '',
        zuhr: initial.zuhr?.slice(0, 5) || '',
        asr: initial.asr?.slice(0, 5) || '',
        maghrib: initial.maghrib?.slice(0, 5) || '',
        isha: initial.isha?.slice(0, 5) || '',
      });
      setNotes(initial.notes || '');
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await save.mutateAsync({ date, ...times, notes: notes || undefined });
    showToast('Prayer times saved.');
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit} className="card geo-border space-y-5 p-6">
      <div>
        <label className="label text-base">Date</label>
        <input
          type="date"
          className="input text-lg"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="label text-base">{f.label}</label>
            <input
              type="time"
              className="input text-lg"
              required
              value={times[f.key]}
              onChange={(e) => setTimes((t) => ({ ...t, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div>
        <label className="label text-base">Special Notes</label>
        <input
          className="input text-lg"
          placeholder="e.g. Ramadan adjustment, holiday timing"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {save.isError && <p className="text-sm text-red-600">{save.error.message}</p>}
      <button className="btn-primary w-full py-3 text-base" type="submit" disabled={save.isPending}>
        {save.isPending ? 'Saving…' : 'Save Prayer Times'}
      </button>
    </form>
  );
}
