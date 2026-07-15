import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PAGE } from './invoiceLayout';
import { drawReportHeader, drawReportFooter } from './reportLayout';
import { formatCurrency, methodLabel } from '../formatters';

export function buildReconciliationPdf(report, settings) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { marginMm: m, widthMm } = PAGE;
  let y = drawReportHeader(doc, {
    title: `Monthly Reconciliation — ${report.month}/${report.year}`,
    settings,
    marginMm: m,
    widthMm,
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total Collected: ${formatCurrency(report.totalCollected)}`, m, y);
  y += 6;
  doc.text(`Total Outstanding: ${formatCurrency(report.totalOutstanding)}`, m, y);
  y += 6;
  doc.text(`Households Billed: ${report.householdsBilled}   Households Paid: ${report.householdsPaid}`, m, y);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    head: [['Payment Method', 'Count', 'Total']],
    body: report.byMethod.map((r) => [methodLabel(r.method), String(r.count), formatCurrency(r.total)]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [79, 127, 94] },
  });

  y = doc.lastAutoTable.finalY + 12;
  drawReportFooter(doc, { marginMm: m, widthMm, y });
  return doc;
}

export function downloadReconciliationPdf(report, settings) {
  const doc = buildReconciliationPdf(report, settings);
  doc.save(`Reconciliation_${report.year}_${String(report.month).padStart(2, '0')}.pdf`);
}
