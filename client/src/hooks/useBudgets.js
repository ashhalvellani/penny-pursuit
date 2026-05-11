import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

const KEY = 'budgets';

export function useBudgets(month) {
  return useQuery({
    queryKey: [KEY, month],
    queryFn: async () => {
      const { data } = await api.get('/api/budgets', { params: { month } });
      return data;
    },
    enabled: !!month,
  });
}

export function useUpsertBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/api/budgets', payload);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [KEY, variables.month] });
      qc.invalidateQueries({ queryKey: ['insights', variables.month] });
    },
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      await api.delete(`/api/budgets/${id}`);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [KEY, variables.month] });
      qc.invalidateQueries({ queryKey: ['insights', variables.month] });
    },
  });
}
