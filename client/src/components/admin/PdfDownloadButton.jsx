import { downloadInvoicePdf } from '../../lib/pdf/buildInvoicePdf';

export function PdfDownloadButton({ model }) {
  return (
    <div className="no-print flex gap-2">
      <button className="btn-secondary" type="button" onClick={() => downloadInvoicePdf(model)}>
        ⬇ Download PDF
      </button>
      <button className="btn-secondary" type="button" onClick={() => window.print()}>
        🖨 Print
      </button>
    </div>
  );
}
