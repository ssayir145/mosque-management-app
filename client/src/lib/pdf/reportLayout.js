import { formatDateTime } from '../formatters';

// Shared header/footer builders reused by both report PDFs so they read as
// one family alongside the invoice template.

export function drawReportHeader(doc, { title, settings, marginMm, widthMm }) {
  let y = marginMm;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings?.mosque_name || 'Mosque', widthMm / 2, y, { align: 'center' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (settings?.address) {
    doc.text(settings.address, widthMm / 2, y, { align: 'center' });
    y += 4.5;
  }
  y += 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(title, widthMm / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generated: ${formatDateTime(new Date())}`, widthMm / 2, y, { align: 'center' });
  y += 6;

  doc.setLineWidth(0.3);
  doc.line(marginMm, y, widthMm - marginMm, y);
  return y + 6;
}

export function drawReportFooter(doc, { marginMm, widthMm, y }) {
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Baarak Allaahu Feekum! — Mosque Management Team', widthMm / 2, y, { align: 'center' });
  doc.setTextColor(20);
}
