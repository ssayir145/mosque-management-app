import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useHouseholds(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['households', params],
    queryFn: () => apiClient.get(`/households${qs ? `?${qs}` : ''}`),
  });
}

export function useHousehold(id) {
  return useQuery({
    queryKey: ['households', id],
    queryFn: () => apiClient.get(`/households/${id}`),
    enabled: !!id,
  });
}

export function useHouseholdPayments(householdId, limit) {
  return useQuery({
    queryKey: ['households', householdId, 'payments', limit],
    queryFn: () => apiClient.get(`/households/${householdId}/payments${limit ? `?limit=${limit}` : ''}`),
    enabled: !!householdId,
  });
}

export function useCreateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/households', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['households'] }),
  });
}

export function useUpdateHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => apiClient.put(`/households/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['households'] }),
  });
}

export function useToggleHouseholdActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }) => apiClient.patch(`/households/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['households'] }),
  });
}

export function useResetHouseholdPassword() {
  return useMutation({
    mutationFn: ({ id, new_password }) => apiClient.patch(`/households/${id}`, { new_password }),
  });
}

// --- Resident "me" endpoints ---

export function useMyHousehold() {
  return useQuery({
    queryKey: ['households', 'me'],
    queryFn: () => apiClient.get('/households/me'),
  });
}

export function useMyPayments(limit = 6) {
  return useQuery({
    queryKey: ['households', 'me', 'payments', limit],
    queryFn: () => apiClient.get(`/households/me/payments?limit=${limit}`),
  });
}

export function useUpdateMyHousehold() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.put('/households/me', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['households', 'me'] }),
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: (data) => apiClient.put('/households/me/password', data),
  });
}
