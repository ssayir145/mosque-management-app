import { usePendingPayments } from '../../hooks/usePayments';
import { useSettings } from '../../hooks/useSettings';
import { ReminderPreviewList } from './ReminderPreviewList';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorState } from '../shared/ErrorState';

export function BulkReminderPanel() {
  const { data: households, isLoading, isError, refetch } = usePendingPayments();
  const { data: settings } = useSettings({ admin: true });

  if (isLoading) return <LoadingSpinner label="Loading pending households…" />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-500">
        Generates a personalized reminder for every household with a pending balance ({households?.length || 0}{' '}
        households). Copy each message individually or copy the full batch for your records, then send manually via
        WhatsApp.
      </p>
      <ReminderPreviewList
        households={households}
        template={settings?.message_templates?.bulk_reminder || ''}
        mosquePhone={settings?.phone}
        reminderType="bulk"
      />
    </div>
  );
}
