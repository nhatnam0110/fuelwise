import type { UserProfile, MacroTargets } from '@/types/user'

const ACTIVITY_MULTIPLIERS: Record<UserProfile['activityLevel'], number> = {
  sedentary: 1.2,
  light:     1.375,
  moderate:  1.55,
  active:    1.725,
}

const GOAL_ADJUSTMENTS: Record<UserProfile['goal'], number> = {
  lose:     -500,
  gain:     +300,
  maintain: 0,
}

export function calculateMacroTargets(profile: UserProfile): MacroTargets {
  // Step 1 — BMR via Mifflin-St Jeor
  const bmr =
    profile.gender === 'male'
      ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
      : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161

  // Step 2 — TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]

  // Step 3 — Goal adjustment
  const calories = Math.round(tdee + GOAL_ADJUSTMENTS[profile.goal])

  // Step 4 — Macro split
  const protein = Math.round(2 * profile.weight)                 // 2g per kg
  const fat     = Math.round((calories * 0.25) / 9)              // 25% of cals ÷ 9
  const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4) // remainder ÷ 4

  return { calories, protein, carbs, fat }
}
