import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSurgeStore = create(
  persist(
    (set) => ({
      activeVersion: 'all',
      manualOverrideId: null,
      history: [],
      entries: [],

      setActiveVersion: (v) => set({ activeVersion: v }),
      setManualOverrideId: (id) => set({ manualOverrideId: id }),
      addToHistory: (entry) => set((state) => ({
        history: [...state.history, { ...entry, ts: new Date().toISOString() }]
      })),
      loadEntries: (newEntries) => set({ entries: newEntries }),
      mergeEntries: (newEntries) => set((state) => ({
        entries: [...state.entries, ...newEntries]
      })),
    }),
    {
      name: 'wild-magic-surge-storage',
      partialize: (state) => ({
        activeVersion: state.activeVersion,
        manualOverrideId: state.manualOverrideId,
        history: state.history,
      }),
    }
  )
);
