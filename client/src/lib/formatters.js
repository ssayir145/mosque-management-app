export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateLike, options) {
  if (!dateLike) return '—';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', options || { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateLike) {
  if (!dateLike) return '—';
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatTime12h(hhmm) {
  if (!hhmm) return '—';
  const [h, m] = String(hhmm).slice(0, 5).split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export function methodLabel(method) {
  const labels = {
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
    online: 'Online',
    cheque: 'Cheque',
    other: 'Other',
  };
  return labels[method] || method;
}

export function categoryLabel(category) {
  const labels = {
    event: 'Event',
    maintenance: 'Maintenance',
    fund: 'Fund',
    general: 'General',
    other: 'Other',
  };
  return labels[category] || category;
}
