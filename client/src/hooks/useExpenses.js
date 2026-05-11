import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { api } from '../lib/api';

const KEY = 'expenses';

function cleanParams(filters = {}) {
  const out = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== '' && v !== null && v !== undefined) out[k] = v;
  }
  return out;
}

export function useExpenses(filters = {}) {
  const params = cleanParams(filters);
  return useQuery({
    queryKey: [KEY, params],
    queryFn: async () => {
      const { data } = await api.get('/api/expenses', { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/expenses', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/api/expenses/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/api/expenses/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['insights'] });
    },
  });
}

export async function exportExpensesCsv(filters = {}) {
  const params = cleanParams(filters);
  const { data } = await api.get('/api/expenses/export.csv', {
    params,
    responseType: 'blob',
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `penny-pursuit-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
