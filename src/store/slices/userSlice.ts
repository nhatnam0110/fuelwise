import type { StateCreator } from 'zustand'
import type { UserProfile, MacroTargets } from '@/types/user'
import type { AppStore } from '../types'

export interface UserSlice {
  profile: UserProfile | null
  macroTargets: MacroTargets | null
  setProfile: (profile: UserProfile) => void
  setMacroTargets: (targets: MacroTargets) => void
}

export const createUserSlice: StateCreator<AppStore, [], [], UserSlice> = (set) => ({
  profile: null,
  macroTargets: null,
  setProfile: (profile) => set({ profile }),
  setMacroTargets: (macroTargets) => set({ macroTargets }),
})
