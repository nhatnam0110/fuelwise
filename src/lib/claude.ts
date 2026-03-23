import Anthropic from '@anthropic-ai/sdk'
import type { Recipe, Nutrition } from '@/types/recipe'
import type { GeneratorInput } from '@/types/log'
import { generateId } from '@/lib/utils'

const MEAL_SIZE_PCT: Record<string, number> = {
  light: 0.25,
  medium: 0.40,
  full: 0.60,
}

function scaleMacros(remaining: Nutrition, mealSize: string): Nutrition {
  const pct = MEAL_SIZE_PCT[mealSize] ?? 0.40
  return {
    calories: Math.round(remaining.calories * pct),
    protein:  Math.round(remaining.protein  * pct),
    carbs:    Math.round(remaining.carbs    * pct),
    fat:      Math.round(remaining.fat      * pct),
  }
}

function buildSystemPrompt(language: 'en' | 'vi'): string {
  const langInstruction = language === 'vi'
    ? `Respond in Vietnamese. Use authentic Vietnamese dish names. Suggest Vietnamese-style portions (300–500 kcal per main meal is normal). Prefer common Vietnamese ingredients.`
    : `Respond in English.`

  return `You are a professional chef and nutritionist AI.
When given ingredients, preferences, and macro targets, generate a recipe that fits as closely as possible within those nutritional constraints.
${langInstruction}
Respond ONLY with a valid JSON object.
No markdown, no explanation, no code blocks, no preamble. Pure raw JSON only.`
}

function buildUserPrompt(input: GeneratorInput, target: Nutrition, language: 'en' | 'vi'): string {
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

export async function generateRecipe(
  input: GeneratorInput,
  remaining: Nutrition,
  language: 'en' | 'vi' = 'en'
): Promise<Recipe> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('API key not set. Add your key to .env as VITE_ANTHROPIC_API_KEY.')
  }

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  const target = scaleMacros(remaining, input.mealSize)

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1600,
    system: buildSystemPrompt(language),
    messages: [
      { role: 'user', content: buildUserPrompt(input, target, language) },
    ],
  })

  const raw = message.content[0]
  if (raw.type !== 'text') {
    throw new Error('Unexpected response format from Claude API.')
  }

  let parsed: Omit<Recipe, 'id'>
  try {
    const cleaned = raw.text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('Failed to parse recipe from AI response. Please try again.')
  }

  return { ...parsed, id: generateId() }
}
