import type { StateCreator } from 'zustand'
import type { AppStore } from '../types'

export interface UiSlice {
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const createUiSlice: StateCreator<AppStore, [], [], UiSlice> = (set) => ({
  isLoading: false,
  error: null,
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})
