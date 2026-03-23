import Anthropic from '@anthropic-ai/sdk'
import type { Recipe, Nutrition } from '@/types/recipe'
import type { GeneratorInput } from '@/types/log'
import { generateId } from '@/lib/utils'

const systemPrompt = `
You are a professional chef and nutritionist AI.
When given ingredients, preferences, and macro targets, generate a recipe
that fits as closely as possible within those nutritional constraints.
Respond ONLY with a valid JSON object.
No markdown, no explanation, no code blocks, no preamble. Pure raw JSON only.
`

function buildUserPrompt(input: GeneratorInput, remaining: Nutrition): string {
  return `
Generate a ${input.mealType} recipe using these ingredients: ${input.ingredients.join(', ')}
Dietary requirements: ${input.dietaryFilters.join(', ') || 'none'}
Cuisine style: ${input.cuisine}

Macro targets to hit (user's remaining macros for today):
- Calories: ${remaining.calories} kcal
- Protein: ${remaining.protein}g
- Carbs: ${remaining.carbs}g
- Fat: ${remaining.fat}g

Try to match these targets as closely as possible.

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
  remaining: Nutrition
): Promise<Recipe> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('API key not set. Add your key to .env as VITE_ANTHROPIC_API_KEY.')
  }

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      { role: 'user', content: buildUserPrompt(input, remaining) },
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
