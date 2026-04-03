import type { StateCreator } from 'zustand'
import type { WeightEntry } from '@/types/weight'
import { generateId } from '@/lib/utils'
import type { AppStore } from '../types'

export interface WeightSlice {
  weightEntries: WeightEntry[]
  goalWeight: number | null
  logWeight: (weight: number, note?: string) => void
  deleteWeight: (id: string) => void
  setGoalWeight: (weight: number) => void
}

export const createWeightSlice: StateCreator<AppStore, [], [], WeightSlice> = (set) => ({
  weightEntries: [],
  goalWeight: null,

  logWeight: (weight, note) =>
    set((state) => ({
      weightEntries: [
        ...state.weightEntries,
        { id: generateId(), weight, loggedAt: Date.now(), note },
      ],
    })),

  deleteWeight: (id) =>
    set((state) => ({
      weightEntries: state.weightEntries.filter((e) => e.id !== id),
    })),

  setGoalWeight: (goalWeight) => set({ goalWeight }),
})
