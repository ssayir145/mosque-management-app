import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function usePendingPayments() {
  return useQuery({
    queryKey: ['payments', 'pending'],
    queryFn: () => apiClient.get('/payments?mode=pending'),
  });
}

export function usePaymentsSummary() {
  return useQuery({
    queryKey: ['payments', 'summary'],
    queryFn: () => apiClient.get('/payments?mode=summary'),
  });
}

export function usePayment(id) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => apiClient.get(`/payments/${id}`),
    enabled: !!id,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/payments', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['households'] });
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
