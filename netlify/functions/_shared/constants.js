const ROLES = { ADMIN: 'admin', CARETAKER: 'caretaker', RESIDENT: 'resident' };

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'online', 'cheque', 'other'];
const ANNOUNCEMENT_CATEGORIES = ['event', 'maintenance', 'fund', 'general'];
const FEEDBACK_CATEGORIES = ['event', 'maintenance', 'fund', 'general', 'other'];
const FEEDBACK_STATUSES = ['new', 'reviewed', 'resolved'];

function formatInvoiceNumber(seq, date = new Date()) {
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `INV-${yyyymm}-${String(seq).padStart(5, '0')}`;
}

module.exports = {
  ROLES,
  PAYMENT_METHODS,
  ANNOUNCEMENT_CATEGORIES,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  formatInvoiceNumber,
};
