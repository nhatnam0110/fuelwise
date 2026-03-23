import type { Nutrition } from './recipe'

export interface LoggedMeal {
  recipeId: string
  recipeTitle: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  nutrition: Nutrition
  loggedAt: number  // timestamp
}

export interface DailyLog {
  date: string      // "2026-03-18"
  meals: LoggedMeal[]
  totals: Nutrition // sum of all logged meals today
}

export interface GeneratorInput {
  ingredients: string[]
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  dietaryFilters: string[]
  cuisine: string
  mealSize: 'light' | 'medium' | 'full'
}
