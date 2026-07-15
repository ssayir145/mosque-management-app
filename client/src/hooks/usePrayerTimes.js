import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function usePrayerTimesToday() {
  return useQuery({
    queryKey: ['prayer-times', 'today'],
    queryFn: () => apiClient.get('/prayer-times/today'),
    refetchInterval: 60_000,
  });
}

export function usePrayerTimesWeek() {
  return useQuery({
    queryKey: ['prayer-times', 'week'],
    queryFn: () => apiClient.get('/prayer-times/week'),
    refetchInterval: 60_000,
  });
}

export function usePrayerTimesHistory(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['prayer-times', 'history', params],
    queryFn: () => apiClient.get(`/prayer-times${qs ? `?${qs}` : ''}`),
  });
}

export function useSavePrayerTime() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/prayer-times', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prayer-times'] }),
  });
}

export function useBulkSavePrayerTimes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entries) => apiClient.post('/prayer-times/bulk', { entries }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prayer-times'] }),
  });
}
