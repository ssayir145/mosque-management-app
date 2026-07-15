import { useState } from 'react';
import { usePendingPayments } from '../../hooks/usePayments';
import { useHouseholdPayments } from '../../hooks/useHouseholds';
import { useSettings } from '../../hooks/useSettings';
import { PendingPaymentsTable } from '../../components/admin/PendingPaymentsTable';
import { PaymentModal } from '../../components/admin/PaymentModal';
import { Modal } from '../../components/shared/Modal';
import { InvoiceView } from '../../components/admin/InvoiceView';
import { PdfDownloadButton } from '../../components/admin/PdfDownloadButton';
import { WhatsAppMessageBox } from '../../components/admin/WhatsAppMessageBox';
import { buildInvoiceModel } from '../../lib/pdf/invoiceLayout';
import { interpolate } from '../../lib/whatsapp';
import { formatCurrency } from '../../lib/formatters';
import { useAuth } from '../../lib/auth/useAuth';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';

export default function AdminPaymentsPage() {
  const { data, isLoading, isError, refetch } = usePendingPayments();
  const { data: settings } = useSettings({ admin: true });
  const { profile } = useAuth();

  const [payHousehold, setPayHousehold] = useState(null);
  const [invoiceHousehold, setInvoiceHousehold] = useState(null);
  const [waHousehold, setWaHousehold] = useState(null);

  const { data: lastPayments } = useHouseholdPayments(invoiceHousehold?.household_id, 1);
  const lastPayment = lastPayments?.[0];

  const invoiceModel =
    invoiceHousehold && lastPayment
      ? buildInvoiceModel(
          {
            ...lastPayment,
            household_name: invoiceHousehold.name,
            phone: invoiceHousehold.phone,
            address: invoiceHousehold.address,
          },
          settings,
          profile?.full_name
        )
      : null;

  const waMessage = waHousehold
    ? interpolate(settings?.message_templates?.selective_reminder || '', {
        name: waHousehold.contact_person || waHousehold.name,
        amount: formatCurrency(waHousehold.pending_amount).replace('₹', ''),
        daysOverdue: waHousehold.days_overdue,
        mosquePhone: settings?.phone || '',
      })
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Payments Management</h2>
        <p className="text-sm text-ink-500">
          Record payments, generate invoices, and reach out to households with dues.
        </p>
      </div>

      {isLoading && <LoadingSpinner />}
      {isError && <ErrorState onRetry={refetch} />}
      {!isLoading && !isError && (
        <div className="card p-5">
          <PendingPaymentsTable
            households={data}
            onMarkPaid={setPayHousehold}
            onGenerateInvoice={setInvoiceHousehold}
            onSendWhatsApp={setWaHousehold}
          />
        </div>
      )}

      <PaymentModal household={payHousehold} onClose={() => setPayHousehold(null)} />

      <Modal open={!!invoiceHousehold} onClose={() => setInvoiceHousehold(null)} title="Invoice" maxWidth="max-w-xl">
        {invoiceHousehold && !lastPayment && (
          <p className="text-sm text-ink-500">No payment has been recorded for this household yet.</p>
        )}
        {invoiceModel && (
          <div className="space-y-4">
            <InvoiceView model={invoiceModel} />
            <PdfDownloadButton model={invoiceModel} />
          </div>
        )}
      </Modal>

      <Modal open={!!waHousehold} onClose={() => setWaHousehold(null)} title="Send Reminder via WhatsApp" maxWidth="max-w-lg">
        {waHousehold && (
          <WhatsAppMessageBox phone={waHousehold.phone} message={waMessage} title={`Reminder for ${waHousehold.name}`} />
        )}
      </Modal>
    </div>
  );
}
