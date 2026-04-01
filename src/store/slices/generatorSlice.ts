import type { StateCreator } from 'zustand'
import type { GeneratorInput } from '@/types/log'
import type { AppStore } from '../types'

export interface GeneratorSlice {
  generatorInput: GeneratorInput
  updateGeneratorInput: (input: Partial<GeneratorInput>) => void
}

export const createGeneratorSlice: StateCreator<AppStore, [], [], GeneratorSlice> = (set) => ({
  generatorInput: {
    ingredients: [],
    mealType: 'dinner',
    dietaryFilters: [],
    cuisine: 'Vietnamese',
    mealSize: 'medium',
  },

  updateGeneratorInput: (input) =>
    set((state) => ({
      generatorInput: { ...state.generatorInput, ...input },
    })),
})
