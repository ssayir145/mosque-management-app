import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PAGE } from './invoiceLayout';
import { formatCurrency, formatDate, formatDateTime, methodLabel } from '../formatters';

export function buildInvoicePdf(model) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const { marginMm: m, widthMm } = PAGE;
  const contentWidth = widthMm - m * 2;
  let y = m;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(model.mosqueName, widthMm / 2, y, { align: 'center' });
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (model.mosqueAddress) {
    doc.text(model.mosqueAddress, widthMm / 2, y, { align: 'center' });
    y += 5;
  }
  if (model.mosquePhone) {
    doc.text(`Phone: ${model.mosquePhone}`, widthMm / 2, y, { align: 'center' });
    y += 5;
  }
  y += 2;
  doc.setLineWidth(0.4);
  doc.line(m, y, widthMm - m, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('PAYMENT RECEIPT', widthMm / 2, y, { align: 'center' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Invoice No: ${model.invoiceNumber}`, m, y);
  doc.text(`Date: ${formatDate(model.date)}`, widthMm - m, y, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('HOUSEHOLD DETAILS', m, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${model.householdName}`, m, y);
  y += 5;
  if (model.householdAddress) {
    doc.text(`Address: ${model.householdAddress}`, m, y);
    y += 5;
  }
  if (model.householdContact) {
    doc.text(`Contact: ${model.householdContact}`, m, y);
    y += 5;
  }
  y += 3;
  doc.line(m, y, widthMm - m, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', m, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: m, right: m },
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1.5 },
    columnStyles: { 0: { fontStyle: 'normal' }, 1: { halign: 'right' } },
    body: [
      ['Amount Received', formatCurrency(model.amount)],
      ['Payment Method', methodLabel(model.method)],
      ['Payment Date', formatDate(model.date)],
      ['Previous Balance', formatCurrency(model.previousBalance)],
      ['Current Balance', formatCurrency(model.newBalance)],
    ],
  });

  y = doc.lastAutoTable.finalY + 6;
  doc.line(m, y, widthMm - m, y);
  y += 7;

  if (model.notes) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const noteLines = doc.splitTextToSize(`Notes: ${model.notes}`, contentWidth);
    doc.text(noteLines, m, y);
    y += noteLines.length * 5 + 3;
    doc.line(m, y, widthMm - m, y);
    y += 7;
  }

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Date Printed: ${formatDateTime(model.printedAt)}`, m, y);
  y += 5;
  if (model.printedBy) {
    doc.text(`Printed By: ${model.printedBy}`, m, y);
    y += 5;
  }
  y += 4;
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Baarak Allaahu Feekum!', widthMm / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Mosque Management Team', widthMm / 2, y, { align: 'center' });

  return doc;
}

export function downloadInvoicePdf(model) {
  const doc = buildInvoicePdf(model);
  const safeName = model.householdName.replace(/[^a-z0-9]+/gi, '_');
  const dateStr = new Date(model.date).toISOString().slice(0, 10);
  doc.save(`Invoice_${safeName}_${dateStr}.pdf`);
}
