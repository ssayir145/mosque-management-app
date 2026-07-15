// Single source of truth for the payment receipt/invoice content, consumed by
// both the jsPDF renderer (buildInvoicePdf.js) and the on-screen/print React
// component (InvoiceView.jsx) so PDF and print output stay in sync - they are
// two different render engines, so this shared model (not shared markup) is
// what keeps them from drifting apart.

export function buildInvoiceModel(payment, settings, printedByName) {
  return {
    mosqueName: settings?.mosque_name || 'Mosque',
    mosqueAddress: settings?.address || '',
    mosquePhone: settings?.phone || '',
    mosqueEmail: settings?.email || '',
    invoiceNumber: payment.invoice_number,
    date: payment.payment_date,
    householdName: payment.household_name,
    householdAddress: payment.address || '',
    householdContact: payment.phone || '',
    amount: Number(payment.amount),
    method: payment.method,
    previousBalance: Number(payment.previous_balance),
    newBalance: Number(payment.new_balance),
    notes: payment.notes || '',
    printedAt: new Date(),
    printedBy: printedByName || '',
  };
}

export const PAGE = {
  widthMm: 210,
  marginMm: 18,
};
