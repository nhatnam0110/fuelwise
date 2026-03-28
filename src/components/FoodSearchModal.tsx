import { useState, useEffect } from 'react'
import { Search, X, Loader2, Plus } from 'lucide-react'
import { useStore } from '@/store'
import { useT } from '@/hooks/useT'
import { generateId } from '@/lib/utils'

interface FoodProduct {
  id: string
  name: string
  per100g: { calories: number; protein: number; carbs: number; fat: number }
}

interface Props {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  onClose: () => void
}

export function FoodSearchModal({ mealType, onClose }: Props) {
  const { logMeal } = useStore()
  const t = useT()
  const tf = t.foodSearch

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [servings, setServings] = useState<Record<string, string>>({})
  const [logged, setLogged] = useState<string | null>(null)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,nutriments`
        )
        const data = await res.json()
        const products: FoodProduct[] = (data.products ?? [])
          .filter((p: Record<string, unknown>) => {
            const nutriments = p.nutriments as Record<string, number> | undefined
            return p.product_name && nutriments?.['energy-kcal_100g']
          })
          .map((p: Record<string, unknown>) => {
            const nutriments = p.nutriments as Record<string, number>
            return {
              id: generateId(),
              name: p.product_name as string,
              per100g: {
                calories: Math.round(nutriments['energy-kcal_100g'] ?? 0),
                protein:  Math.round(nutriments['proteins_100g']      ?? 0),
                carbs:    Math.round(nutriments['carbohydrates_100g'] ?? 0),
                fat:      Math.round(nutriments['fat_100g']           ?? 0),
              },
            }
          })
        setResults(products)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  function handleLog(food: FoodProduct) {
    const grams = parseFloat(servings[food.id] ?? '100')
    if (isNaN(grams) || grams <= 0) return
    const f = grams / 100
    logMeal({
      recipeId: food.id,
      recipeTitle: food.name,
      mealType,
      nutrition: {
        calories: Math.round(food.per100g.calories * f),
        protein:  Math.round(food.per100g.protein  * f),
        carbs:    Math.round(food.per100g.carbs    * f),
        fat:      Math.round(food.per100g.fat      * f),
      },
      loggedAt: Date.now(),
    })
    setLogged(food.id)
    setTimeout(onClose, 600)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 md:pb-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0d1d10] rounded-3xl border border-[#172a1a] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#172a1a]">
          <h3 className="text-xl font-black text-white">{tf.title}</h3>
          <button onClick={onClose} className="text-[#a0af9e] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-[#172a1a]">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0af9e]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tf.placeholder}
              autoFocus
              className="w-full bg-[#172a1a] text-white rounded-xl py-3 pl-11 pr-4 text-sm placeholder:text-[#a0af9e]/50 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/40 transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[#a0af9e] text-sm">
              <Loader2 size={18} className="animate-spin" /> {tf.searching}
            </div>
          ) : results.length === 0 && query.length >= 2 ? (
            <p className="py-12 text-center text-[#a0af9e] text-sm">{tf.noResults}</p>
          ) : (
            <div className="divide-y divide-[#172a1a]">
              {results.map((food) => (
                <div key={food.id} className="flex items-center gap-3 px-5 py-4 hover:bg-[#172a1a]/40 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold leading-tight truncate">{food.name}</p>
                    <p className="text-[#a0af9e] text-[11px] mt-1">
                      {tf.per100g}: <span className="text-[#4ade80] font-bold">{food.per100g.calories} kcal</span>
                      {' · '}{food.per100g.protein}g P · {food.per100g.carbs}g C · {food.per100g.fat}g F
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      value={servings[food.id] ?? '100'}
                      onChange={(e) => setServings((s) => ({ ...s, [food.id]: e.target.value }))}
                      className="w-14 bg-[#172a1a] text-white text-xs rounded-lg px-2 py-1.5 text-center outline-none focus:ring-1 focus:ring-[#4ade80]"
                    />
                    <span className="text-[#a0af9e] text-xs">g</span>
                    <button
                      onClick={() => handleLog(food)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        logged === food.id
                          ? 'bg-[#4ade80]/20 text-[#4ade80]'
                          : 'bg-[#4ade80] text-[#051107] hover:scale-110'
                      }`}
                    >
                      {logged === food.id ? '✓' : <Plus size={16} strokeWidth={3} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#172a1a]">
          <p className="text-[10px] text-[#3d4b3e] text-center">{tf.hint}</p>
        </div>
      </div>
    </div>
  )
}
