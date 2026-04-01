import { useState, useEffect } from 'react'
import { searchFoods } from '@/services/openFoodFacts'

export interface FoodProduct {
  id: string
  name: string
  per100g: { calories: number; protein: number; carbs: number; fat: number }
}

export function useFoodSearch(query: string) {
  const [results, setResults] = useState<FoodProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setFetchError(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setFetchError(false)
      try {
        const products = await searchFoods(query)
        setResults(products)
      } catch {
        setResults([])
        setFetchError(true)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  return { results, loading, fetchError }
}
