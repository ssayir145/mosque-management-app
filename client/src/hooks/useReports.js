import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function usePendingReport() {
  return useQuery({
    queryKey: ['reports', 'pending'],
    queryFn: () => apiClient.get('/reports/pending'),
  });
}

export function useReconciliationReport(month, year) {
  return useQuery({
    queryKey: ['reports', 'reconciliation', month, year],
    queryFn: () => apiClient.get(`/reports/reconciliation?month=${month}&year=${year}`),
    enabled: !!month && !!year,
  });
}
