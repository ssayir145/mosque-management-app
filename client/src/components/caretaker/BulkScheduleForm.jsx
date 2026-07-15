import { useState } from 'react';
import { useBulkSavePrayerTimes } from '../../hooks/usePrayerTimes';
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

function addDaysStr(dateStr, n) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function BulkScheduleForm() {
  const [startDate, setStartDate] = useState(todayStr());
  const [days, setDays] = useState(7);
  const [times, setTimes] = useState({ fajr: '', zuhr: '', asr: '', maghrib: '', isha: '' });
  const [notes, setNotes] = useState('');
  const bulkSave = useBulkSavePrayerTimes();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entries = Array.from({ length: days }, (_, i) => ({
      date: addDaysStr(startDate, i),
      ...times,
      notes: notes || undefined,
    }));
    const result = await bulkSave.mutateAsync(entries);
    showToast(`Saved ${result.savedCount} day(s) of prayer times.`);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 p-6">
      <p className="text-sm text-ink-500">
        Apply the same timings across a range of days — useful for posting a week or month ahead in one go.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label text-base">Start Date</label>
          <input
            type="date"
            className="input text-lg"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label text-base">Number of Days</label>
          <select className="input text-lg" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>1 week (7 days)</option>
            <option value={14}>2 weeks (14 days)</option>
            <option value={30}>1 month (30 days)</option>
          </select>
        </div>
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Ramadan schedule"
        />
      </div>
      {bulkSave.isError && <p className="text-sm text-red-600">{bulkSave.error.message}</p>}
      <button className="btn-primary w-full py-3 text-base" type="submit" disabled={bulkSave.isPending}>
        {bulkSave.isPending ? 'Saving…' : `Save ${days} Days`}
      </button>
    </form>
  );
}
