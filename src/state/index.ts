import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppStore } from './types'
import { createUserSlice } from './slices/userSlice'
import { createLogSlice } from './slices/logSlice'
import { createRecipeSlice } from './slices/recipeSlice'
import { createGeneratorSlice } from './slices/generatorSlice'
import { createUiSlice } from './slices/uiSlice'
import { createLanguageSlice } from './slices/languageSlice'
import { createWeightSlice } from './slices/weightSlice'

export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createLogSlice(...a),
      ...createRecipeSlice(...a),
      ...createGeneratorSlice(...a),
      ...createUiSlice(...a),
      ...createLanguageSlice(...a),
      ...createWeightSlice(...a),
    }),
    {
      name: 'fuelwise-store',
      partialize: (state) => ({
        profile: state.profile,
        macroTargets: state.macroTargets,
        savedRecipes: state.savedRecipes,
        dailyLog: state.dailyLog,
        logHistory: state.logHistory,
        language: state.language,
        weightEntries: state.weightEntries,
        goalWeight: state.goalWeight,
      }),
    }
  )
)
