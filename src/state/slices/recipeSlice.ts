import type { StateCreator } from 'zustand'
import type { Recipe } from '@/types/recipe'
import type { AppStore } from '../types'

export interface RecipeSlice {
  currentRecipe: Recipe | null
  savedRecipes: Recipe[]
  setCurrentRecipe: (recipe: Recipe) => void
  saveRecipe: (recipe: Recipe) => void
  deleteRecipe: (id: string) => void
}

export const createRecipeSlice: StateCreator<AppStore, [], [], RecipeSlice> = (set) => ({
  currentRecipe: null,
  savedRecipes: [],

  setCurrentRecipe: (recipe) => set({ currentRecipe: recipe }),

  saveRecipe: (recipe) =>
    set((state) => ({
      savedRecipes: [
        ...state.savedRecipes.filter((r) => r.id !== recipe.id),
        { ...recipe, savedAt: Date.now() },
      ],
    })),

  deleteRecipe: (id) =>
    set((state) => ({
      savedRecipes: state.savedRecipes.filter((r) => r.id !== id),
    })),
})
