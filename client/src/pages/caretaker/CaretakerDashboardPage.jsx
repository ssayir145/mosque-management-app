import { useState } from 'react';
import { PrayerTimeForm } from '../../components/caretaker/PrayerTimeForm';
import { PrayerTimeHistoryList } from '../../components/caretaker/PrayerTimeHistoryList';

export default function CaretakerDashboardPage() {
  const [editing, setEditing] = useState(null);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-ink-900">
        {editing ? 'Edit Timings' : "Today's Prayer Times"}
      </h2>
      <PrayerTimeForm key={editing?.date || 'today'} initial={editing} onSaved={() => setEditing(null)} />
      {editing && (
        <button className="btn-secondary w-full" type="button" onClick={() => setEditing(null)}>
          Cancel Edit / Back to Today
        </button>
      )}

      <div>
        <h3 className="mb-3 font-display text-lg font-semibold text-ink-900">Last 7 Days</h3>
        <PrayerTimeHistoryList onEdit={setEditing} />
      </div>
    </div>
  );
}
