import { useState, useEffect, useMemo } from 'react'
import { Search, X, Loader2, Plus, Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import { useT } from '@/hooks/useT'
import { generateId } from '@/lib/utils'

interface FoodProduct {
  id: string
  name: string
  per100g: { calories: number; protein: number; carbs: number; fat: number }
}

interface StagedItem {
  food: FoodProduct
  grams: number
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
  const [staged, setStaged] = useState<StagedItem[]>([])

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
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  function calcNutrition(food: FoodProduct, grams: number) {
    const f = grams / 100
    return {
      calories: Math.round(food.per100g.calories * f),
      protein:  Math.round(food.per100g.protein  * f),
      carbs:    Math.round(food.per100g.carbs    * f),
      fat:      Math.round(food.per100g.fat      * f),
    }
  }

  function handleStage(food: FoodProduct) {
    const grams = parseFloat(servings[food.id] ?? '100')
    if (isNaN(grams) || grams <= 0) return
    setStaged((prev) => [...prev, { food, grams }])
  }

  function removeStaged(idx: number) {
    setStaged((prev) => prev.filter((_, i) => i !== idx))
  }

  const totals = useMemo(() =>
    staged.reduce(
      (acc, { food, grams }) => {
        const n = calcNutrition(food, grams)
        return {
          calories: acc.calories + n.calories,
          protein:  acc.protein  + n.protein,
          carbs:    acc.carbs    + n.carbs,
          fat:      acc.fat      + n.fat,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    ),
  [staged])

  function handleSubmit() {
    if (staged.length === 0) return
    staged.forEach(({ food, grams }) => {
      logMeal({
        recipeId: food.id,
        recipeTitle: food.name,
        mealType,
        nutrition: calcNutrition(food, grams),
        loggedAt: Date.now(),
      })
    })
    onClose()
  }

  const mealLabel = t.common[mealType as keyof typeof t.common] as string

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 md:pb-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-[#0d1d10] rounded-3xl border border-[#172a1a] overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#172a1a] flex-shrink-0">
          <div>
            <h3 className="text-lg font-black text-white">{tf.title}</h3>
            <p className="text-[11px] text-[#a0af9e] capitalize mt-0.5">{mealLabel}</p>
          </div>
          <button onClick={onClose} className="text-[#a0af9e] hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-[#172a1a] flex-shrink-0">
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

        {/* Search results */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-[#a0af9e] text-sm">
              <Loader2 size={18} className="animate-spin" /> {tf.searching}
            </div>
          ) : results.length === 0 && query.length >= 2 ? (
            <p className="py-8 text-center text-[#a0af9e] text-sm">{tf.noResults}</p>
          ) : (
            <div className="divide-y divide-[#172a1a]">
              {results.map((food) => (
                <div key={food.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#172a1a]/40 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold leading-tight truncate">{food.name}</p>
                    <p className="text-[#a0af9e] text-[11px] mt-0.5">
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
                      onClick={() => handleStage(food)}
                      className="w-8 h-8 rounded-full bg-[#4ade80] text-[#051107] flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Staged items */}
        {staged.length > 0 && (
          <div className="border-t border-[#4ade80]/20 bg-[#08160b] flex-shrink-0">
            <div className="px-5 py-3 space-y-2 max-h-40 overflow-y-auto">
              {staged.map((item, i) => {
                const n = calcNutrition(item.food, item.grams)
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{item.food.name}</p>
                      <p className="text-[#a0af9e] text-[10px]">
                        {item.grams}g · <span className="text-[#4ade80]">{n.calories} kcal</span>
                        {' · '}{n.protein}g P · {n.carbs}g C · {n.fat}g F
                      </p>
                    </div>
                    <button onClick={() => removeStaged(i)} className="text-[#a0af9e] hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Totals + Submit */}
            <div className="px-5 py-4 border-t border-[#172a1a] space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-[#a0af9e] uppercase tracking-widest">Total</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-[#4ade80] font-black">{totals.calories} kcal</span>
                  <span className="text-[#699cff]">{totals.protein}g P</span>
                  <span className="text-[#facc15]">{totals.carbs}g C</span>
                  <span className="text-[#c084fc]">{totals.fat}g F</span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl font-black text-sm text-[#051107] transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #4ade80, #19be64)' }}
              >
                {tf.logBtn} {mealLabel}
              </button>
            </div>
          </div>
        )}

        {staged.length === 0 && (
          <div className="px-6 py-3 border-t border-[#172a1a] flex-shrink-0">
            <p className="text-[10px] text-[#3d4b3e] text-center">{tf.hint}</p>
          </div>
        )}
      </div>
    </div>
  )
}
