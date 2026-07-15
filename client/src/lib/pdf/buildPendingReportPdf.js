import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PAGE } from './invoiceLayout';
import { drawReportHeader, drawReportFooter } from './reportLayout';
import { formatCurrency, formatDate } from '../formatters';

export function buildPendingReportPdf({ households, totalPending, settings }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { marginMm: m, widthMm } = PAGE;
  let y = drawReportHeader(doc, { title: 'Pending Payments Report', settings, marginMm: m, widthMm });

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: [['Household', 'Contact', 'Phone', 'Pending', 'Days Overdue', 'Last Payment']],
    body: households.map((h) => [
      h.name,
      h.contact_person || '—',
      h.phone,
      formatCurrency(h.pending_amount),
      String(h.days_overdue),
      h.last_payment_date ? formatDate(h.last_payment_date) : '—',
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 127, 94] },
  });

  y = doc.lastAutoTable.finalY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Total Pending: ${formatCurrency(totalPending)}  ·  ${households.length} household(s)`, m, y);
  y += 12;

  drawReportFooter(doc, { marginMm: m, widthMm, y });
  return doc;
}

export function downloadPendingReportPdf(data) {
  const doc = buildPendingReportPdf(data);
  doc.save(`Pending_Payments_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
