import { useState } from 'react';
import { Modal } from '../shared/Modal';
import { useRecordPayment } from '../../hooks/usePayments';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../lib/auth/useAuth';
import { InvoiceView } from './InvoiceView';
import { PdfDownloadButton } from './PdfDownloadButton';
import { WhatsAppMessageBox } from './WhatsAppMessageBox';
import { buildInvoiceModel } from '../../lib/pdf/invoiceLayout';
import { interpolate } from '../../lib/whatsapp';
import { formatCurrency, formatDate, methodLabel } from '../../lib/formatters';
import { useToast } from '../shared/Toast';

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online', label: 'Online' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'other', label: 'Other' },
];

export function PaymentModal({ household, onClose }) {
  const [step, setStep] = useState('form');
  const [amount, setAmount] = useState(household ? String(household.pending_amount) : '');
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState(null);
  const recordPayment = useRecordPayment();
  const { data: settings } = useSettings({ admin: true });
  const { profile } = useAuth();
  const { showToast } = useToast();

  if (!household) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await recordPayment.mutateAsync({
        household_id: household.household_id,
        amount: Number(amount),
        method,
        notes: notes || undefined,
      });
      setPayment({ ...result, phone: household.phone, address: household.address });
      setStep('result');
      showToast('Payment recorded successfully.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const model = payment ? buildInvoiceModel(payment, settings, profile?.full_name) : null;
  const waMessage = payment
    ? interpolate(settings?.message_templates?.payment_confirmation || '', {
        name: household.contact_person || household.name,
        amount: formatCurrency(payment.amount).replace('₹', ''),
        date: formatDate(payment.payment_date),
        method: methodLabel(payment.method),
        balance: formatCurrency(payment.new_balance).replace('₹', ''),
      })
    : '';

  return (
    <Modal
      open={!!household}
      onClose={onClose}
      title={step === 'form' ? 'Record Payment' : 'Payment Recorded'}
      maxWidth="max-w-xl"
    >
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-sage-50 p-3 text-sm">
            <p className="font-semibold text-ink-900">{household.name}</p>
            <p className="text-ink-500">Pending: {formatCurrency(household.pending_amount)}</p>
          </div>
          <div>
            <label className="label">Payment Method</label>
            <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount Paid</label>
            <input
              className="input"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Notes / Reference (optional)</label>
            <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={recordPayment.isPending}>
              {recordPayment.isPending ? 'Recording…' : 'Confirm & Record Payment'}
            </button>
          </div>
        </form>
      )}

      {step === 'result' && model && (
        <div className="space-y-4">
          <InvoiceView model={model} />
          <PdfDownloadButton model={model} />
          <WhatsAppMessageBox phone={payment.phone} message={waMessage} title="Payment Confirmation Message" />
          <div className="no-print flex justify-end">
            <button className="btn-secondary" type="button" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
