export interface Ingredient {
  name: string
  amount: string
}

export interface Nutrition {
  calories: number
  protein: number  // grams
  carbs: number    // grams
  fat: number      // grams
}

export interface Recipe {
  id: string
  title: string
  description: string
  cuisine: string
  cookTime: string
  servings: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  ingredients: Ingredient[]
  steps: string[]
  nutrition: Nutrition
  dietaryTags: string[]
  macroFitScore?: number  // 0–100, how well it matched targets
  savedAt?: number        // timestamp
}
