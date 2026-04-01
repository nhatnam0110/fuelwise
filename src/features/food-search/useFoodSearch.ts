import { useState, useEffect } from 'react'
import { generateId } from '@/lib/utils'

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
        const res = await fetch(
          `/api/off/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments`
        )
        const data = await res.json()
        const products: FoodProduct[] = (data.products ?? [])
          .filter((p: Record<string, unknown>) => !!p.product_name)
          .map((p: Record<string, unknown>) => {
            const n = (p.nutriments ?? {}) as Record<string, number>
            const kcal = n['energy-kcal_100g'] ?? Math.round((n['energy_100g'] ?? 0) / 4.184)
            return {
              id: generateId(),
              name: p.product_name as string,
              per100g: {
                calories: Math.round(kcal),
                protein:  Math.round(n['proteins_100g']      ?? 0),
                carbs:    Math.round(n['carbohydrates_100g'] ?? 0),
                fat:      Math.round(n['fat_100g']           ?? 0),
              },
            }
          })
          .filter((p: FoodProduct) => p.per100g.calories > 0)
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
