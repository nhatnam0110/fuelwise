import type { Recipe, Nutrition } from '@/types/recipe'
import type { GeneratorInput } from '@/types/log'
import { generateId } from '@/lib/utils'
import { scaleMacros, buildSystemPrompt, buildUserPrompt } from './promptBuilder'
import { callClaude } from './claudeClient'
import { parseRecipeResponse } from './recipeParser'

/**
 * Orchestrates the full recipe-generation workflow:
 * scale macro targets -> build prompts -> call Claude -> parse + validate
 * the response -> attach a local id.
 */
export async function generateRecipe(
  input: GeneratorInput,
  remaining: Nutrition,
  language: 'en' | 'vi' = 'en'
): Promise<Recipe> {
  const target = scaleMacros(remaining, input.mealSize)
  const systemPrompt = buildSystemPrompt(language)
  const userPrompt = buildUserPrompt(input, target, language)

  const rawText = await callClaude(systemPrompt, userPrompt)
  const parsed = parseRecipeResponse(rawText)

  return { ...parsed, id: generateId() }
}
