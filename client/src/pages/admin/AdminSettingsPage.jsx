import { useState } from 'react';
import { SettingsForm } from '../../components/admin/SettingsForm';
import { AdminUsersManager } from '../../components/admin/AdminUsersManager';
import { PrayerTimeForm } from '../../components/caretaker/PrayerTimeForm';

const TABS = [
  { key: 'general', label: 'Mosque & Templates' },
  { key: 'prayer', label: 'Prayer Time Override' },
  { key: 'users', label: 'Admin Users' },
];

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('general');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Settings</h2>
        <p className="text-sm text-ink-500">Configure mosque details, message templates, and staff accounts.</p>
      </div>

      <div className="flex flex-wrap gap-2">
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

      {tab === 'general' && <SettingsForm />}
      {tab === 'prayer' && (
        <div className="max-w-lg">
          <p className="mb-4 text-sm text-ink-500">
            Manually adjust today&apos;s (or any day&apos;s) prayer times, overriding the caretaker&apos;s entry if
            needed.
          </p>
          <PrayerTimeForm />
        </div>
      )}
      {tab === 'users' && <AdminUsersManager />}
    </div>
  );
}
