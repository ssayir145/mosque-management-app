import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useEligibleHouseholds(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['reminders', 'eligible', params],
    queryFn: () => apiClient.get(`/reminders/eligible${qs ? `?${qs}` : ''}`),
  });
}

export function useReminderLogs() {
  return useQuery({
    queryKey: ['reminders', 'logs'],
    queryFn: () => apiClient.get('/reminders'),
  });
}

export function useGenerateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/reminders/generate', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reminders', 'logs'] }),
  });
}
