import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Recipe, Nutrition } from '@/types/recipe'
import type { UserProfile, MacroTargets } from '@/types/user'
import type { DailyLog, LoggedMeal, GeneratorInput } from '@/types/log'

interface AppStore {
  // --- User ---
  profile: UserProfile | null
  macroTargets: MacroTargets | null
  setProfile: (profile: UserProfile) => void
  setMacroTargets: (targets: MacroTargets) => void

  // --- Daily log ---
  dailyLog: DailyLog | null
  logMeal: (meal: LoggedMeal) => void
  deleteLoggedMeal: (loggedAt: number) => void
  resetDailyLog: () => void
  getRemainingMacros: () => Nutrition

  // --- Recipes ---
  currentRecipe: Recipe | null
  savedRecipes: Recipe[]
  setCurrentRecipe: (recipe: Recipe) => void
  saveRecipe: (recipe: Recipe) => void
  deleteRecipe: (id: string) => void

  // --- Generator ---
  generatorInput: GeneratorInput
  updateGeneratorInput: (input: Partial<GeneratorInput>) => void

  // --- UI state ---
  isLoading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // --- Language ---
  language: 'en' | 'vi'
  setLanguage: (lang: 'en' | 'vi') => void
}

const today = () => new Date().toISOString().split('T')[0]

const emptyNutrition = (): Nutrition => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
})

export const useStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // --- User ---
      profile: null,
      macroTargets: null,
      setProfile: (profile) => set({ profile }),
      setMacroTargets: (macroTargets) => set({ macroTargets }),

      // --- Daily log ---
      dailyLog: null,

      logMeal: (meal) =>
        set((state) => {
          const existing = state.dailyLog ?? {
            date: today(),
            meals: [],
            totals: emptyNutrition(),
          }
          const updatedMeals = [...existing.meals, meal]
          const updatedTotals: Nutrition = {
            calories: existing.totals.calories + meal.nutrition.calories,
            protein: existing.totals.protein + meal.nutrition.protein,
            carbs: existing.totals.carbs + meal.nutrition.carbs,
            fat: existing.totals.fat + meal.nutrition.fat,
          }
          return {
            dailyLog: {
              ...existing,
              meals: updatedMeals,
              totals: updatedTotals,
            },
          }
        }),

      deleteLoggedMeal: (loggedAt) =>
        set((state) => {
          if (!state.dailyLog) return {}
          const meals = state.dailyLog.meals.filter((m) => m.loggedAt !== loggedAt)
          const totals = meals.reduce<Nutrition>(
            (acc, m) => ({
              calories: acc.calories + m.nutrition.calories,
              protein:  acc.protein  + m.nutrition.protein,
              carbs:    acc.carbs    + m.nutrition.carbs,
              fat:      acc.fat      + m.nutrition.fat,
            }),
            emptyNutrition()
          )
          return { dailyLog: { ...state.dailyLog, meals, totals } }
        }),

      resetDailyLog: () =>
        set({
          dailyLog: {
            date: today(),
            meals: [],
            totals: emptyNutrition(),
          },
        }),

      getRemainingMacros: () => {
        const { macroTargets, dailyLog } = get()
        if (!macroTargets) return emptyNutrition()
        const totals = dailyLog?.totals ?? emptyNutrition()
        return {
          calories: Math.max(0, macroTargets.calories - totals.calories),
          protein: Math.max(0, macroTargets.protein - totals.protein),
          carbs: Math.max(0, macroTargets.carbs - totals.carbs),
          fat: Math.max(0, macroTargets.fat - totals.fat),
        }
      },

      // --- Recipes ---
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

      // --- Generator ---
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

      // --- UI state ---
      isLoading: false,
      error: null,
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // --- Language ---
      language: 'vi',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'fuelwise-store', // localStorage key
      partialize: (state) => ({
        profile: state.profile,
        macroTargets: state.macroTargets,
        savedRecipes: state.savedRecipes,
        dailyLog: state.dailyLog,
        language: state.language,
      }),
    }
  )
)
