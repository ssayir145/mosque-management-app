import { useState } from 'react';
import { useHouseholds, useToggleHouseholdActive, useHouseholdPayments } from '../../hooks/useHouseholds';
import { HouseholdsTable } from '../../components/admin/HouseholdsTable';
import { HouseholdFormModal } from '../../components/admin/HouseholdFormModal';
import { ResetPasswordModal } from '../../components/admin/ResetPasswordModal';
import { Modal } from '../../components/shared/Modal';
import { PaymentHistoryTable } from '../../components/resident/PaymentHistoryTable';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';
import { useToast } from '../../components/shared/Toast';

export default function AdminHouseholdsPage() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, refetch } = useHouseholds(search ? { search } : {});
  const toggleActive = useToggleHouseholdActive();
  const { showToast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingHousehold, setEditingHousehold] = useState(null);
  const [historyHousehold, setHistoryHousehold] = useState(null);
  const [resetPasswordHousehold, setResetPasswordHousehold] = useState(null);
  const { data: history } = useHouseholdPayments(historyHousehold?.id, 50);

  const handleToggle = async (h) => {
    await toggleActive.mutateAsync({ id: h.id, active: !h.active });
    showToast(h.active ? 'Household deactivated.' : 'Household activated.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Residents Management</h2>
          <p className="text-sm text-ink-500">Add, edit, and review households.</p>
        </div>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            setEditingHousehold(null);
            setFormOpen(true);
          }}
        >
          + Add Household
        </button>
      </div>

      <input
        className="input max-w-sm"
        placeholder="Search by name, contact, or phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={refetch} />}
      {!isLoading && !isError && (
        <div className="card p-5">
          <HouseholdsTable
            households={data}
            onEdit={(h) => {
              setEditingHousehold(h);
              setFormOpen(true);
            }}
            onToggleActive={handleToggle}
            onViewPayments={setHistoryHousehold}
            onResetPassword={setResetPasswordHousehold}
          />
        </div>
      )}

      <HouseholdFormModal open={formOpen} household={editingHousehold} onClose={() => setFormOpen(false)} />
      <ResetPasswordModal household={resetPasswordHousehold} onClose={() => setResetPasswordHousehold(null)} />

      <Modal
        open={!!historyHousehold}
        onClose={() => setHistoryHousehold(null)}
        title={`Payment History — ${historyHousehold?.name || ''}`}
        maxWidth="max-w-2xl"
      >
        <PaymentHistoryTable payments={history} />
      </Modal>
    </div>
  );
}
