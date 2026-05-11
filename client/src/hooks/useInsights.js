import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

const KEY = 'insights';

export function useInsights(month) {
  return useQuery({
    queryKey: [KEY, month],
    queryFn: async () => {
      const { data } = await api.get('/api/ai/insights', { params: { month } });
      return data;
    },
    enabled: !!month,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshInsights() {
  const qc = useQueryClient();
  return async (month) => {
    const { data } = await api.get('/api/ai/insights', {
      params: { month, refresh: 1 },
    });
    qc.setQueryData([KEY, month], data);
    return data;
  };
}
