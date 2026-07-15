import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useSettings({ admin = false } = {}) {
  return useQuery({
    queryKey: ['settings', { admin }],
    queryFn: () => apiClient.get(admin ? '/settings?admin=1' : '/settings'),
    staleTime: 5 * 60_000,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.put('/settings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
