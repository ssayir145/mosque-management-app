import { Link } from 'react-router-dom';
import { OverviewCards } from '../../components/admin/OverviewCards';
import { PendingPaymentsTable } from '../../components/admin/PendingPaymentsTable';
import { usePendingPayments } from '../../hooks/usePayments';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch } = usePendingPayments();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Overview</h2>
        <p className="text-sm text-ink-500">A snapshot of mosque finances and outstanding dues.</p>
      </div>
      <OverviewCards />
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink-900">Households with Pending Dues</h3>
          <Link to="/admin/payments" className="text-sm font-medium text-sage-600 hover:underline">
            Manage payments →
          </Link>
        </div>
        <div className="card p-5">
          {isLoading && <LoadingSpinner />}
          {isError && <ErrorState onRetry={refetch} />}
          {!isLoading && !isError && <PendingPaymentsTable households={(data || []).slice(0, 5)} />}
        </div>
      </section>
    </div>
  );
}
