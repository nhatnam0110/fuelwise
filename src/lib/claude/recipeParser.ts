import { z } from 'zod'
import type { Recipe } from '@/types/recipe'

const recipeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  cuisine: z.string().min(1),
  cookTime: z.string().min(1),
  servings: z.number().positive(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  ingredients: z.array(z.object({ name: z.string(), amount: z.string() })).min(1),
  steps: z.array(z.string()).min(1),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
  dietaryTags: z.array(z.string()),
  macroFitScore: z.number().optional(),
})

/**
 * Strips markdown code-fence wrapping. Claude is told not to add one, but
 * models don't always comply, so this is defensive rather than optional.
 */
function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(stripFences(raw))
  } catch {
    throw new Error('Failed to parse recipe from AI response. Please try again.')
  }
}

/**
 * Parses and validates Claude's raw text reply against `recipeSchema`,
 * throwing a specific error naming the first field that's missing or
 * malformed instead of letting a bad shape reach the UI (e.g. a model that
 * drops "steps" or returns strings for numbers).
 */
export function parseRecipeResponse(raw: string): Omit<Recipe, 'id'> {
  const data = parseJson(raw)
  const result = recipeSchema.safeParse(data)

  if (!result.success) {
    const issue = result.error.issues[0]
    throw new Error(`AI response failed validation: ${issue.message} (${issue.path.join('.')})`)
  }

  return result.data
}
