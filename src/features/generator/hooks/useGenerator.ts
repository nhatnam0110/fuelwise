import { useNavigate } from 'react-router-dom'
import { useStore } from '@/state'
import { generateRecipe } from '@/services/claude'

export function useGenerator() {
  const navigate = useNavigate()
  const {
    generatorInput, updateGeneratorInput,
    setCurrentRecipe, getRemainingMacros,
    isLoading, setLoading, error, setError, language,
  } = useStore()

  const remaining = getRemainingMacros()

  const addIngredient = (val: string) => {
    if (!val || generatorInput.ingredients.includes(val)) return
    updateGeneratorInput({ ingredients: [...generatorInput.ingredients, val] })
  }

  const removeIngredient = (item: string) =>
    updateGeneratorInput({ ingredients: generatorInput.ingredients.filter((i) => i !== item) })

  const generate = async () => {
    setError(null)
    setLoading(true)
    try {
      const recipe = await generateRecipe(generatorInput, remaining, language)
      setCurrentRecipe(recipe)
      navigate(`/recipe/${recipe.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return { generatorInput, updateGeneratorInput, remaining, isLoading, error, addIngredient, removeIngredient, generate }
}
