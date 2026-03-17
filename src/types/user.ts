export interface UserProfile {
  name: string
  age: number
  weight: number  // kg
  height: number  // cm
  gender: 'male' | 'female'
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active'
  goal: 'lose' | 'gain' | 'maintain'
  onboardingComplete: boolean
}

export interface MacroTargets {
  calories: number
  protein: number  // grams
  carbs: number    // grams
  fat: number      // grams
}
