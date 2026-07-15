import { useEffect, useState } from 'react';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { useToast } from '../shared/Toast';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const TEMPLATE_FIELDS = [
  { key: 'payment_confirmation', label: 'Payment Confirmation Message' },
  { key: 'bulk_reminder', label: 'Bulk Reminder Message' },
  { key: 'selective_reminder', label: 'Selective Reminder Message' },
];

export function SettingsForm() {
  const { data: settings, isLoading } = useSettings({ admin: true });
  const update = useUpdateSettings();
  const { showToast } = useToast();

  const [mosqueName, setMosqueName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [templates, setTemplates] = useState({});

  useEffect(() => {
    if (settings) {
      setMosqueName(settings.mosque_name || '');
      setAddress(settings.address || '');
      setPhone(settings.phone || '');
      setEmail(settings.email || '');
      setLogoUrl(settings.logo_url || '');
      setTemplates(settings.message_templates || {});
    }
  }, [settings]);

  if (isLoading) return <LoadingSpinner label="Loading settings…" />;

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    await update.mutateAsync({ mosque_name: mosqueName, address, phone, email, logo_url: logoUrl || undefined });
    showToast('Mosque details updated.');
  };

  const handleTemplatesSubmit = async (e) => {
    e.preventDefault();
    await update.mutateAsync({ message_templates: templates });
    showToast('Message templates updated.');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleDetailsSubmit} className="card space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900">Mosque Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Mosque Name</label>
            <input className="input" required value={mosqueName} onChange={(e) => setMosqueName(e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <button className="btn-primary" type="submit" disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save Mosque Details'}
        </button>
      </form>

      <form onSubmit={handleTemplatesSubmit} className="card space-y-4 p-6">
        <h3 className="font-display text-lg font-semibold text-ink-900">Message Templates</h3>
        <p className="text-xs text-ink-400">
          Use placeholders like {'{{name}}'}, {'{{amount}}'}, {'{{date}}'}, {'{{method}}'}, {'{{balance}}'},{' '}
          {'{{daysOverdue}}'}, {'{{mosquePhone}}'}.
        </p>
        {TEMPLATE_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}</label>
            <textarea
              className="input min-h-[100px] font-mono text-xs"
              value={templates[f.key] || ''}
              onChange={(e) => setTemplates((t) => ({ ...t, [f.key]: e.target.value }))}
            />
          </div>
        ))}
        <button className="btn-primary" type="submit" disabled={update.isPending}>
          {update.isPending ? 'Saving…' : 'Save Templates'}
        </button>
      </form>
    </div>
  );
}
