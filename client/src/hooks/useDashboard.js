import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function useDashboard(month) {
  return useQuery({
    queryKey: ['dashboard', month],
    queryFn: async () => {
      const { data } = await api.get('/api/dashboard/summary', { params: { month } });
      return data;
    },
  });
}
