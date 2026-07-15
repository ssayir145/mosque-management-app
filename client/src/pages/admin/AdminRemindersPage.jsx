import { useState } from 'react';
import { BulkReminderPanel } from '../../components/admin/BulkReminderPanel';
import { SelectiveReminderPanel } from '../../components/admin/SelectiveReminderPanel';
import { useReminderLogs } from '../../hooks/useReminders';
import { formatDateTime } from '../../lib/formatters';

const TABS = [
  { key: 'bulk', label: 'All Pending' },
  { key: 'selective', label: 'Selective' },
  { key: 'history', label: 'History' },
];

export default function AdminRemindersPage() {
  const [tab, setTab] = useState('bulk');
  const { data: logs } = useReminderLogs();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Reminders</h2>
        <p className="text-sm text-ink-500">Generate WhatsApp reminder messages for households with pending dues.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`btn-secondary ${tab === t.key ? '!border-sage-600 !bg-sage-600 !text-white' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card p-5">
        {tab === 'bulk' && <BulkReminderPanel />}
        {tab === 'selective' && <SelectiveReminderPanel />}
        {tab === 'history' && (
          <div className="space-y-2">
            {(logs || []).map((l) => (
              <div key={l.id} className="rounded-lg border border-ink-100 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="badge bg-sage-50 text-sage-700">{l.reminder_type}</span>
                  <span className="text-xs text-ink-400">{formatDateTime(l.generated_at)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-500">
                  {l.household_count} household(s) · by {l.generated_by_name || 'Admin'}
                </p>
              </div>
            ))}
            {(!logs || logs.length === 0) && <p className="text-sm text-ink-400">No reminders logged yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
