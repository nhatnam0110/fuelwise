import type { StateCreator } from 'zustand'
import type { Nutrition } from '@/types/recipe'
import type { DailyLog, LoggedMeal } from '@/types/log'
import type { AppStore } from '../types'

export interface LogSlice {
  dailyLog: DailyLog | null
  logMeal: (meal: LoggedMeal) => void
  deleteLoggedMeal: (loggedAt: number) => void
  resetDailyLog: () => void
  getRemainingMacros: () => Nutrition
}

const today = () => new Date().toISOString().split('T')[0]

const emptyNutrition = (): Nutrition => ({ calories: 0, protein: 0, carbs: 0, fat: 0 })

export const createLogSlice: StateCreator<AppStore, [], [], LogSlice> = (set, get) => ({
  dailyLog: null,

  logMeal: (meal) =>
    set((state) => {
      const existing = state.dailyLog ?? { date: today(), meals: [], totals: emptyNutrition() }
      const updatedMeals = [...existing.meals, meal]
      const updatedTotals: Nutrition = {
        calories: existing.totals.calories + meal.nutrition.calories,
        protein:  existing.totals.protein  + meal.nutrition.protein,
        carbs:    existing.totals.carbs    + meal.nutrition.carbs,
        fat:      existing.totals.fat      + meal.nutrition.fat,
      }
      return { dailyLog: { ...existing, meals: updatedMeals, totals: updatedTotals } }
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
    set({ dailyLog: { date: today(), meals: [], totals: emptyNutrition() } }),

  getRemainingMacros: () => {
    const { macroTargets, dailyLog } = get()
    if (!macroTargets) return emptyNutrition()
    const totals = dailyLog?.totals ?? emptyNutrition()
    return {
      calories: Math.max(0, macroTargets.calories - totals.calories),
      protein:  Math.max(0, macroTargets.protein  - totals.protein),
      carbs:    Math.max(0, macroTargets.carbs    - totals.carbs),
      fat:      Math.max(0, macroTargets.fat      - totals.fat),
    }
  },
})
