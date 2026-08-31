import type { Nutrition } from '@/types/recipe'
import type { GeneratorInput } from '@/types/log'

const MEAL_SIZE_PCT: Record<string, number> = {
  light: 0.25,
  medium: 0.40,
  full: 0.60,
}

/** Scales the user's remaining daily macro budget down to a single-meal target. */
export function scaleMacros(remaining: Nutrition, mealSize: string): Nutrition {
  const pct = MEAL_SIZE_PCT[mealSize] ?? 0.40
  return {
    calories: Math.round(remaining.calories * pct),
    protein:  Math.round(remaining.protein  * pct),
    carbs:    Math.round(remaining.carbs    * pct),
    fat:      Math.round(remaining.fat      * pct),
  }
}

export function buildSystemPrompt(language: 'en' | 'vi'): string {
  const langInstruction = language === 'vi'
    ? `Respond in Vietnamese. Use authentic Vietnamese dish names. Suggest Vietnamese-style portions (300–500 kcal per main meal is normal). Prefer common Vietnamese ingredients.`
    : `Respond in English.`

  return `You are a professional chef and nutritionist AI.
When given ingredients, preferences, and macro targets, generate a recipe that fits as closely as possible within those nutritional constraints.
${langInstruction}
Respond ONLY with a valid JSON object.
No markdown, no explanation, no code blocks, no preamble. Pure raw JSON only.`
}

export function buildUserPrompt(input: GeneratorInput, target: Nutrition, language: 'en' | 'vi'): string {
  return `
Generate a ${input.mealType} recipe for the "${input.cuisine}" cuisine style.

The user has these ingredients available: ${input.ingredients.join(', ')}
Treat these as the MAIN ingredients — you MUST use them.
You are also free (and encouraged) to add common pantry staples and complementary ingredients (e.g. garlic, onion, oil, soy sauce, fish sauce, salt, pepper, spring onion, chili, lime, eggs, rice, noodles, broth, cornstarch, herbs, etc.) to make the dish complete, balanced, and delicious. Do not limit the recipe only to the listed ingredients.

Dietary requirements: ${input.dietaryFilters.join(', ') || 'none'}

Macro targets for this single meal:
- Calories: ${target.calories} kcal
- Protein: ${target.protein}g
- Carbs: ${target.carbs}g
- Fat: ${target.fat}g

Rules:
- Match the macro targets as closely as possible.
- Write clear, step-by-step cooking instructions (at least 5 steps).
- Include realistic ingredient amounts (grams, ml, tablespoons, etc.).
- The recipe should be practical and achievable at home.
${language === 'vi' ? '- All text (title, description, ingredient names, step instructions) must be in Vietnamese.' : ''}

Return EXACTLY this JSON shape with no other text:
{
  "title": string,
  "description": string,
  "cuisine": string,
  "cookTime": string,
  "servings": number,
  "mealType": "${input.mealType}",
  "ingredients": [{ "name": string, "amount": string }],
  "steps": [string],
  "nutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  },
  "dietaryTags": [string],
  "macroFitScore": number
}

macroFitScore = 0–100 integer. 100 means perfect macro match.
Calculate as: 100 minus the average percentage deviation across all 4 macros.
`
}
