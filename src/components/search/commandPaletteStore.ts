'use client';

import { create } from 'zustand';

interface CommandPaletteStore {
  open: boolean;
  query: string;
  selectedIndex: number;
  /** Which SearchBar instance owns the open dropdown */
  activeInstanceId: string | null;
  openPalette: (instanceId: string) => void;
  closePalette: () => void;
  togglePalette: (instanceId?: string) => void;
  setQuery: (query: string) => void;
  setSelectedIndex: (index: number) => void;
}

export const useCommandPaletteStore = create<CommandPaletteStore>((set, get) => ({
  open: false,
  query: '',
  selectedIndex: 0,
  activeInstanceId: null,

  openPalette: (instanceId) => set({ open: true, activeInstanceId: instanceId, selectedIndex: 0 }),

  closePalette: () => set({ open: false, query: '', selectedIndex: 0, activeInstanceId: null }),

  togglePalette: (instanceId) => {
    const state = get();
    if (state.open) {
      state.closePalette();
    } else {
      state.openPalette(instanceId ?? 'global');
    }
  },

  setQuery: (query) => set({ query, selectedIndex: 0 }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
}));
