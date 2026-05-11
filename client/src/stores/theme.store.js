import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia(SYSTEM_QUERY).matches
    : false;
}

export function resolveTheme(theme) {
  if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return theme === 'dark' ? 'dark' : 'light';
}

export function applyThemeClass(theme) {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.style.colorScheme = resolved;
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggle: () => {
        const current = get().theme;
        if (current === 'system') {
          set({ theme: systemPrefersDark() ? 'light' : 'dark' });
        } else {
          set({ theme: current === 'light' ? 'dark' : 'light' });
        }
      },
    }),
    { name: 'pp-theme' }
  )
);
