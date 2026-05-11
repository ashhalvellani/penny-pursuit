import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_URL } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

async function fetchMe() {
  const { data } = await api.get('/api/auth/me');
  return data.user;
}

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser);
  const clear = useAuthStore((s) => s.clear);

  const query = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess) setUser(query.data);
    if (query.isError) clear();
  }, [query.isSuccess, query.isError, query.data, setUser, clear]);

  return query;
}

export function useLogout() {
  const qc = useQueryClient();
  const clear = useAuthStore((s) => s.clear);

  return useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout');
    },
    onSuccess: () => {
      clear();
      qc.clear();
      window.location.assign('/login');
    },
  });
}

export function startGoogleLogin() {
  window.location.assign(`${API_URL}/api/auth/google`);
}
