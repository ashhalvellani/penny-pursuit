import { create } from 'zustand';

export const useConfirmStore = create((set, get) => ({
  options: null,
  resolve: null,
  open: (options) =>
    new Promise((resolve) => {
      set({ options, resolve });
    }),
  close: (result) => {
    const { resolve } = get();
    resolve?.(result);
    set({ options: null, resolve: null });
  },
}));

export const confirm = (options) => useConfirmStore.getState().open(options);
