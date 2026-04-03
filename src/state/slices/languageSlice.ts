import type { StateCreator } from 'zustand'
import type { AppStore } from '../types'

export interface LanguageSlice {
  language: 'en' | 'vi'
  setLanguage: (lang: 'en' | 'vi') => void
}

export const createLanguageSlice: StateCreator<AppStore, [], [], LanguageSlice> = (set) => ({
  language: 'vi',
  setLanguage: (language) => set({ language }),
})
