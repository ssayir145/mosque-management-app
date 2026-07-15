import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (data) => apiClient.post('/feedback', data),
  });
}

export function useMyFeedback() {
  return useQuery({
    queryKey: ['feedback', 'me'],
    queryFn: () => apiClient.get('/feedback/me'),
  });
}

export function useAllFeedback(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['feedback', 'all', params],
    queryFn: () => apiClient.get(`/feedback${qs ? `?${qs}` : ''}`),
  });
}

export function useUpdateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.patch(`/feedback/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feedback'] }),
  });
}
