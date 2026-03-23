import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Loader2, Search, Sparkles, UtensilsCrossed, SlidersHorizontal, Globe } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/store'
import { generateRecipe } from '@/lib/claude'

import breakfastImg from '@/assets/breakfast.jpg'
import lunchImg from '@/assets/lunch.jpg'
import dinnerImg from '@/assets/dinner.jpg'
import snackImg from '@/assets/snack.jpg'

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', img: breakfastImg },
  { id: 'lunch',     label: 'Lunch',     img: lunchImg },
  { id: 'dinner',    label: 'Dinner',    img: dinnerImg },
  { id: 'snack',     label: 'Snack',     img: snackImg },
] as const

const DIETARY_FILTERS = ['None', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 'Vegetarian']
const CUISINES        = ['Any', 'Mediterranean', 'Japanese', 'Mexican', 'Thai', 'Italian', 'Indian']
const RECENT          = ['Avocado', 'Greek Yogurt', 'Sweet Potato', 'Kale', 'Chicken Breast', 'Quinoa']

export default function Generator() {
  const navigate = useNavigate()
  const {
    generatorInput, updateGeneratorInput,
    setCurrentRecipe, getRemainingMacros,
    isLoading, setLoading, error, setError,
  } = useStore()

  const remaining = getRemainingMacros()
  const [ingredientInput, setIngredientInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addIngredient = (val = ingredientInput.trim()) => {
    if (!val || generatorInput.ingredients.includes(val)) return
    updateGeneratorInput({ ingredients: [...generatorInput.ingredients, val] })
    setIngredientInput('')
    inputRef.current?.focus()
  }

  const removeIngredient = (item: string) =>
    updateGeneratorInput({ ingredients: generatorInput.ingredients.filter((i) => i !== item) })

  const toggleFilter = (f: string) => {
    if (f === 'None') { updateGeneratorInput({ dietaryFilters: [] }); return }
    const filters = generatorInput.dietaryFilters
    updateGeneratorInput({
      dietaryFilters: filters.includes(f) ? filters.filter((x) => x !== f) : [...filters, f],
    })
  }

  const handleGenerate = async () => {
    setError(null)
    setLoading(true)
    try {
      const recipe = await generateRecipe(generatorInput, remaining)
      setCurrentRecipe(recipe)
      navigate(`/recipe/${recipe.id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper className="bg-[#051107] text-white min-h-screen pt-24 pb-24 md:pb-8 px-6 md:px-12 lg:px-24">

      {/* Page header */}
      <header className="mb-10">
        <h1 className="font-black text-4xl md:text-5xl uppercase tracking-tighter text-white mb-6">
          What's in your kitchen?
        </h1>

        {/* Remaining macros */}
        <div className="bg-[#172a1a]/60 backdrop-blur-lg rounded-2xl p-5 border border-[#3d4b3e]/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-[#a0af9e] text-xs uppercase tracking-widest mb-1">Target Balance</p>
              <h2 className="text-2xl font-black text-[#4ade80]">Remaining Macros</h2>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'CALORIES', value: remaining.calories.toLocaleString(), color: '#4ade80' },
                { label: 'PROTEIN',  value: `${remaining.protein}g`,             color: '#699cff' },
                { label: 'CARBS',    value: `${remaining.carbs}g`,               color: '#caeada' },
                { label: 'FAT',      value: `${remaining.fat}g`,                 color: '#ff716c' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xl md:text-2xl font-black" style={{ color }}>{value}</span>
                  <span className="text-[10px] text-[#a0af9e] tracking-widest">{label}</span>
                  <div className="h-1 w-10 bg-[#172a1a] mt-2 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* LEFT: inputs */}
        <div className="flex-1 space-y-10">

          {/* Ingredients */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed size={18} className="text-[#4ade80]" />
              <h3 className="font-black text-lg text-white">Ingredients</h3>
            </div>
            <div className="relative mb-4">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0af9e]" />
              <input
                ref={inputRef}
                type="text"
                value={ingredientInput}
                placeholder="Add ingredients (e.g. Chicken breast, Spinach...)"
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                className="w-full bg-[#0d1d10] rounded-xl py-4 pl-11 pr-4 text-white text-sm placeholder:text-[#a0af9e]/50 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/40 transition-all"
              />
            </div>
            {/* Recently used */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] text-[#a0af9e] uppercase tracking-widest w-full mb-1">Recently Used</span>
              {RECENT.map((item) => (
                <button
                  key={item}
                  onClick={() => addIngredient(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#122315] text-[#a0af9e] text-xs hover:bg-[#4ade80]/10 hover:text-[#4ade80] transition-all border border-[#3d4b3e]/10"
                >
                  {item}
                  <X size={11} />
                </button>
              ))}
            </div>
          </section>

          {/* Meal type */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#4ade80] text-lg">🍽</span>
              <h3 className="font-black text-lg text-white">Meal Type</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MEAL_TYPES.map(({ id, label, img }) => {
                const active = generatorInput.mealType === id
                return (
                  <button
                    key={id}
                    onClick={() => updateGeneratorInput({ mealType: id })}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      active ? 'border-[#4ade80] ring-2 ring-[#4ade80]' : 'border-transparent hover:border-[#4ade80]/50'
                    }`}
                  >
                    <img src={img} alt={label} className={`absolute inset-0 w-full h-full object-cover transition-opacity ${active ? 'opacity-50' : 'opacity-30 group-hover:opacity-50'}`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className={`absolute bottom-3 left-3 font-black text-base transition-colors ${active ? 'text-[#4ade80]' : 'text-white group-hover:text-[#4ade80]'}`}>
                      {label}
                    </span>
                    {active && (
                      <div className="absolute top-3 right-3 bg-[#4ade80] text-[#051107] w-5 h-5 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-black">✓</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Dietary filters + Cuisine */}
          <section className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal size={16} className="text-[#4ade80]" />
                <h3 className="font-black text-base text-white">Dietary Restrictions</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {DIETARY_FILTERS.map((f) => {
                  const active = f === 'None' ? generatorInput.dietaryFilters.length === 0 : generatorInput.dietaryFilters.includes(f)
                  return (
                    <button
                      key={f}
                      onClick={() => toggleFilter(f)}
                      className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                        active ? 'bg-[#4ade80] text-[#051107]' : 'bg-[#122315] text-[#a0af9e] hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} className="text-[#4ade80]" />
                <h3 className="font-black text-base text-white">Cuisine Style</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateGeneratorInput({ cuisine: c })}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      generatorInput.cuisine === c
                        ? 'bg-[#122315] border border-[#4ade80]/40 text-[#4ade80]'
                        : 'bg-[#122315] text-[#a0af9e] hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: sidebar */}
        <aside className="lg:w-80">
          <div className="bg-[#172a1a]/60 backdrop-blur-lg rounded-2xl p-6 border border-[#3d4b3e]/10 lg:sticky lg:top-28 space-y-6">
            <h3 className="font-black text-lg text-white">Kitchen Inventory</h3>

            {/* Added ingredients */}
            {generatorInput.ingredients.length === 0 ? (
              <p className="text-[#a0af9e] text-sm">No ingredients added yet.</p>
            ) : (
              <div className="space-y-3">
                {generatorInput.ingredients.map((item) => (
                  <div key={item} className="flex justify-between items-center group">
                    <span className="text-white text-sm">{item}</span>
                    <button onClick={() => removeIngredient(item)} className="text-[#a0af9e] hover:text-[#ff716c] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-[#3d4b3e]/10 space-y-6">
              {/* Error */}
              {error && (
                <div className="bg-red-950/50 border border-red-800 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading || generatorInput.ingredients.length === 0}
                className="w-full py-5 rounded-full bg-gradient-to-br from-[#4ade80] to-[#19be64] text-[#002f13] font-black text-lg tracking-tight shadow-[0_0_40px_rgba(25,190,100,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <><Loader2 size={20} className="animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles size={20} /> GENERATE RECIPE</>
                )}
              </button>

              <p className="text-[10px] text-center text-[#a0af9e]/40 leading-relaxed">
                Our AI chef will analyze your ingredients and macro targets to curate the perfect meal.
              </p>
            </div>
          </div>
        </aside>
      </div>

    </PageWrapper>
  )
}
