import { useState } from 'react';
import { usePendingReport, useReconciliationReport } from '../../hooks/useReports';
import { useSettings } from '../../hooks/useSettings';
import { PendingReportView } from '../../components/admin/PendingReportView';
import { ReconciliationReportView } from '../../components/admin/ReconciliationReportView';
import { downloadPendingReportPdf } from '../../lib/pdf/buildPendingReportPdf';
import { downloadReconciliationPdf } from '../../lib/pdf/buildReconciliationPdf';
import { LoadingSpinner } from '../../components/shared/LoadingSpinner';
import { ErrorState } from '../../components/shared/ErrorState';

const now = new Date();

export default function AdminReportsPage() {
  const [tab, setTab] = useState('pending');
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: settings } = useSettings({ admin: true });
  const pendingReport = usePendingReport();
  const reconciliationReport = useReconciliationReport(month, year);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Reports</h2>
        <p className="text-sm text-ink-500">Print or export financial reports for the committee.</p>
      </div>

      <div className="no-print flex gap-2">
        <button
          type="button"
          className={`btn-secondary ${tab === 'pending' ? '!border-sage-600 !bg-sage-600 !text-white' : ''}`}
          onClick={() => setTab('pending')}
        >
          Pending Payments
        </button>
        <button
          type="button"
          className={`btn-secondary ${tab === 'reconciliation' ? '!border-sage-600 !bg-sage-600 !text-white' : ''}`}
          onClick={() => setTab('reconciliation')}
        >
          Monthly Reconciliation
        </button>
      </div>

      {tab === 'pending' && (
        <div className="space-y-4">
          {pendingReport.isLoading && <LoadingSpinner />}
          {pendingReport.isError && <ErrorState onRetry={pendingReport.refetch} />}
          {pendingReport.data && (
            <>
              <div className="no-print flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadPendingReportPdf({ ...pendingReport.data, settings })}
                >
                  ⬇ Download PDF
                </button>
                <button type="button" className="btn-secondary" onClick={() => window.print()}>
                  🖨 Print
                </button>
              </div>
              <div className="card p-6">
                <PendingReportView report={pendingReport.data} settings={settings} />
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'reconciliation' && (
        <div className="space-y-4">
          <div className="no-print flex flex-wrap items-end gap-3">
            <div>
              <label className="label">Month</label>
              <select className="input w-auto" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input
                className="input w-24"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>
          </div>
          {reconciliationReport.isLoading && <LoadingSpinner />}
          {reconciliationReport.isError && <ErrorState onRetry={reconciliationReport.refetch} />}
          {reconciliationReport.data && (
            <>
              <div className="no-print flex gap-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => downloadReconciliationPdf(reconciliationReport.data, settings)}
                >
                  ⬇ Download PDF
                </button>
                <button type="button" className="btn-secondary" onClick={() => window.print()}>
                  🖨 Print
                </button>
              </div>
              <div className="card p-6">
                <ReconciliationReportView report={reconciliationReport.data} settings={settings} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
