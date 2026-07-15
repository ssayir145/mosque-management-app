import { useMemo } from 'react';
import { interpolate, buildWaLink, copyToClipboard } from '../../lib/whatsapp';
import { formatCurrency } from '../../lib/formatters';
import { useGenerateReminder } from '../../hooks/useReminders';
import { useToast } from '../shared/Toast';

// Shared by BulkReminderPanel and SelectiveReminderPanel: both need to turn a
// list of households into personalized messages, offer per-household and
// combined copy/open-in-WhatsApp actions, and log the generation event.
export function ReminderPreviewList({ households, template, mosquePhone, reminderType, filterCriteria }) {
  const { showToast } = useToast();
  const generateReminder = useGenerateReminder();

  const messages = useMemo(
    () =>
      (households || []).map((h) => {
        const message = interpolate(template, {
          name: h.contact_person || h.name,
          amount: formatCurrency(h.pending_amount).replace('₹', ''),
          daysOverdue: h.days_overdue,
          mosquePhone: mosquePhone || '',
        });
        return { household: h, message, waLink: buildWaLink(h.phone, message) };
      }),
    [households, template, mosquePhone]
  );

  const combined = messages.map((m) => `— ${m.household.name} (${m.household.phone}) —\n${m.message}`).join('\n\n');

  const handleCopyAll = async () => {
    const success = await copyToClipboard(combined);
    showToast(
      success ? 'All messages copied.' : 'Could not copy — try copying individually.',
      success ? 'success' : 'error'
    );
  };

  const handleCopyOne = async (message) => {
    const success = await copyToClipboard(message);
    showToast(success ? 'Message copied.' : 'Copy failed.', success ? 'success' : 'error');
  };

  const handleLog = async () => {
    if (messages.length === 0) return;
    await generateReminder.mutateAsync({
      reminder_type: reminderType,
      household_ids: messages.map((m) => m.household.household_id),
      message_snapshot: combined,
      filter_criteria: filterCriteria,
    });
    showToast('Reminder generation logged.');
  };

  if (!households || households.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
        No households match.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <button className="btn-secondary" type="button" onClick={handleCopyAll}>
          📋 Copy All Messages
        </button>
        <button className="btn-primary" type="button" onClick={handleLog} disabled={generateReminder.isPending}>
          {generateReminder.isPending ? 'Logging…' : '🗂 Log This Reminder Batch'}
        </button>
      </div>
      <div className="space-y-2">
        {messages.map(({ household, message, waLink }) => (
          <details key={household.household_id} className="card p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink-900">{household.name}</p>
                  <p className="text-xs text-ink-400">
                    {household.phone} · {formatCurrency(household.pending_amount)} pending · {household.days_overdue}{' '}
                    days overdue
                  </p>
                </div>
                <span className="text-xs text-sage-600">View message ▾</span>
              </div>
            </summary>
            <div className="mt-3 space-y-2">
              <pre className="whitespace-pre-wrap rounded-lg bg-ink-50 p-3 text-xs">{message}</pre>
              <div className="flex gap-2">
                <button className="btn-secondary text-xs" type="button" onClick={() => handleCopyOne(message)}>
                  Copy
                </button>
                <a className="btn-primary text-xs" href={waLink} target="_blank" rel="noreferrer">
                  Open in WhatsApp
                </a>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
