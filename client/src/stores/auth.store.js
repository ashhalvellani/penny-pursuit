import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isBootstrapped: false,
  setUser: (user) => set({ user, isBootstrapped: true }),
  clear: () => set({ user: null, isBootstrapped: true }),
}));
