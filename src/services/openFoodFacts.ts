import { generateId } from '@/lib/utils'
import type { FoodProduct } from '@/features/food-search/useFoodSearch'

export async function searchFoods(query: string): Promise<FoodProduct[]> {
  const res = await fetch(
    `/api/off/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments`
  )
  const data = await res.json()

  return (data.products ?? [])
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
}
