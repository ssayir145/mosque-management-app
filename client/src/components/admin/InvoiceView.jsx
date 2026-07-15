import { formatCurrency, formatDate, formatDateTime, methodLabel } from '../../lib/formatters';

// On-screen / print rendering of the payment receipt. Wrapped in
// id="print-root" so the @media print rules in index.css isolate it from
// the rest of the page when window.print() is triggered.
export function InvoiceView({ model }) {
  return (
    <div id="print-root" className="mx-auto max-w-md bg-white p-2 text-ink-900">
      <div className="geo-border rounded-xl border border-sage-200 p-6">
        <div className="text-center">
          <p className="text-2xl">🕌</p>
          <h2 className="font-display text-xl font-bold">{model.mosqueName}</h2>
          {model.mosqueAddress && <p className="text-xs text-ink-500">{model.mosqueAddress}</p>}
          {model.mosquePhone && <p className="text-xs text-ink-500">Phone: {model.mosquePhone}</p>}
        </div>

        <hr className="my-4 border-ink-200" />
        <h3 className="text-center text-sm font-bold uppercase tracking-wide">Payment Receipt</h3>
        <div className="mt-3 flex justify-between text-xs text-ink-600">
          <span>Invoice No: {model.invoiceNumber}</span>
          <span>Date: {formatDate(model.date)}</span>
        </div>

        <hr className="my-4 border-ink-200" />
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-500">Household Details</h4>
        <p className="mt-2 text-sm">Name: {model.householdName}</p>
        {model.householdAddress && <p className="text-sm">Address: {model.householdAddress}</p>}
        {model.householdContact && <p className="text-sm">Contact: {model.householdContact}</p>}

        <hr className="my-4 border-ink-200" />
        <h4 className="text-xs font-bold uppercase tracking-wide text-ink-500">Payment Details</h4>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Amount Received</dt>
            <dd className="font-semibold">{formatCurrency(model.amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Payment Method</dt>
            <dd>{methodLabel(model.method)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Payment Date</dt>
            <dd>{formatDate(model.date)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Previous Balance</dt>
            <dd>{formatCurrency(model.previousBalance)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-sage-700">
            <dt>Current Balance</dt>
            <dd>{formatCurrency(model.newBalance)}</dd>
          </div>
        </dl>

        {model.notes && (
          <>
            <hr className="my-4 border-ink-200" />
            <p className="text-sm">
              <span className="font-semibold">Notes:</span> {model.notes}
            </p>
          </>
        )}

        <hr className="my-4 border-ink-200" />
        <p className="text-[11px] text-ink-400">Date Printed: {formatDateTime(model.printedAt)}</p>
        {model.printedBy && <p className="text-[11px] text-ink-400">Printed By: {model.printedBy}</p>}
        <p className="mt-3 text-center font-display text-sm font-bold text-sage-700">Baarak Allaahu Feekum!</p>
        <p className="text-center text-xs text-ink-500">Mosque Management Team</p>
      </div>
    </div>
  );
}
