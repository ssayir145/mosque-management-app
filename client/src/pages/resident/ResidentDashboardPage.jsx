import { useMyHousehold, useMyPayments } from '../../hooks/useHouseholds';
import { HouseholdSummaryCard } from '../../components/resident/HouseholdSummaryCard';
import { PaymentHistoryTable } from '../../components/resident/PaymentHistoryTable';
import { PrayerTimesWidget } from '../../components/shared/PrayerTimesWidget';
import { AnnouncementsFeed } from '../../components/shared/AnnouncementsFeed';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';

export default function ResidentDashboardPage() {
  const { data: household, isLoading, isError, refetch } = useMyHousehold();
  const { data: payments } = useMyPayments(6);

  if (isLoading) return <LoadingSpinner label="Loading your dashboard…" />;
  if (isError) return <ErrorState onRetry={refetch} message="Could not load your household." />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">
          Assalamu Alaikum, {household?.contact_person || household?.name}
        </h2>
        <p className="text-sm text-ink-500">{household?.name}</p>
      </div>

      <HouseholdSummaryCard household={household} />

      <PrayerTimesWidget />

      <section>
        <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">Payment History</h3>
        <div className="card p-5">
          <PaymentHistoryTable payments={payments} />
        </div>
      </section>

      <section>
        <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">Announcements</h3>
        <AnnouncementsFeed />
      </section>
    </div>
  );
}
