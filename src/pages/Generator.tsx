import { useState } from 'react'
import { X, Loader2, Sparkles, Globe, ClipboardList } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useT } from '@/hooks/useT'
import { useGenerator } from '@/features/generator/hooks/useGenerator'
import { FoodSearchModal } from '@/features/nutrition/components/FoodSearchModal'
import { IngredientInput } from '@/features/generator/components/IngredientInput'

import breakfastImg from '@/assets/breakfast.jpg'
import lunchImg from '@/assets/lunch.jpg'
import dinnerImg from '@/assets/dinner.jpg'
import snackImg from '@/assets/snack.jpg'

const MEAL_TYPE_IMGS = { breakfast: breakfastImg, lunch: lunchImg, dinner: dinnerImg, snack: snackImg }
const MEAL_TYPE_IDS = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export default function Generator() {
  const t = useT()
  const { generatorInput, updateGeneratorInput, remaining, isLoading, error, addIngredient, removeIngredient, generate } = useGenerator()
  const [showFoodSearch, setShowFoodSearch] = useState(false)

  return (
    <>
    <PageWrapper className="text-white min-h-screen pt-24 pb-24 md:pb-8 px-6 md:px-12 lg:px-24">

      {/* Page header */}
      <header className="mb-10">
        <h1 className="font-black text-4xl md:text-5xl uppercase tracking-tighter text-white mb-6">
          {t.generator.title}
        </h1>

        <div className="bg-[#172a1a]/60 backdrop-blur-lg rounded-2xl p-5 border border-[#3d4b3e]/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-[#a0af9e] text-xs uppercase tracking-widest mb-1">{t.generator.targetBalance}</p>
              <h2 className="text-2xl font-black text-[#4ade80]">{t.generator.remainingMacros}</h2>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: t.common.calories.toUpperCase(), value: remaining.calories.toLocaleString(), color: '#4ade80' },
                { label: t.common.protein.toUpperCase(),  value: `${remaining.protein}g`,             color: '#699cff' },
                { label: t.common.carbs.toUpperCase(),    value: `${remaining.carbs}g`,               color: '#caeada' },
                { label: t.common.fat.toUpperCase(),      value: `${remaining.fat}g`,                 color: '#ff716c' },
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
          <IngredientInput ingredients={generatorInput.ingredients} onAdd={addIngredient} />

          {/* Meal type */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[#4ade80] text-lg">🍽</span>
              <h3 className="font-black text-lg text-white">{t.generator.mealTypeTitle}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MEAL_TYPE_IDS.map((id) => {
                const active = generatorInput.mealType === id
                const label = t.generator.mealTypeLabels[id]
                const img = MEAL_TYPE_IMGS[id]
                return (
                  <button key={id} onClick={() => updateGeneratorInput({ mealType: id })}
                    className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      active ? 'border-[#4ade80] ring-2 ring-[#4ade80]' : 'border-transparent hover:border-[#4ade80]/50'
                    }`}>
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

          {/* Cuisine */}
          <section className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Globe size={16} className="text-[#4ade80]" />
                <h3 className="font-black text-base text-white">{t.generator.cuisineTitle}</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {t.generator.cuisineOptions.map((c) => (
                  <button key={c} onClick={() => updateGeneratorInput({ cuisine: c })}
                    className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                      generatorInput.cuisine === c
                        ? 'bg-[#122315] border border-[#4ade80]/40 text-[#4ade80]'
                        : 'bg-[#122315] text-[#a0af9e] hover:text-white'
                    }`}>
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
            <h3 className="font-black text-lg text-white">{t.generator.kitchenInventory}</h3>

            {generatorInput.ingredients.length === 0 ? (
              <p className="text-[#a0af9e] text-sm">{t.generator.noIngredients}</p>
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

            {/* Meal size */}
            <div className="pt-4 border-t border-[#3d4b3e]/10 space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-[#a0af9e]">{t.generator.mealSizeTitle}</p>
              <div className="grid grid-cols-3 gap-2">
                {t.generator.mealSizes.map(({ id, label, desc }) => {
                  const active = generatorInput.mealSize === id
                  return (
                    <button key={id}
                      onClick={() => updateGeneratorInput({ mealSize: id as 'light' | 'medium' | 'full' })}
                      className={`flex flex-col items-center py-3 px-2 rounded-xl border transition-all text-center ${
                        active ? 'border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]' : 'border-[#1a3a1f] text-[#a0af9e] hover:border-[#4ade80]/40'
                      }`}>
                      <span className="font-black text-sm">{label}</span>
                      <span className="text-[9px] mt-0.5 opacity-70">{desc}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2 space-y-4">
              {error && (
                <div className="bg-red-950/50 border border-red-800 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={generate}
                disabled={isLoading || generatorInput.ingredients.length === 0}
                className="w-full py-5 rounded-full bg-gradient-to-br from-[#4ade80] to-[#19be64] text-[#002f13] font-black text-lg tracking-tight shadow-[0_0_40px_rgba(25,190,100,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading
                  ? <><Loader2 size={20} className="animate-spin" /> {t.generator.generating}</>
                  : <><Sparkles size={20} /> {t.generator.generateBtn.toUpperCase()}</>
                }
              </button>

              <button
                onClick={() => setShowFoodSearch(true)}
                className="w-full py-3 rounded-full border border-[#3d4b3e] text-[#a0af9e] font-bold text-sm flex items-center justify-center gap-2 hover:border-[#4ade80]/40 hover:text-white transition-all"
              >
                <ClipboardList size={16} /> {t.foodSearch.title}
              </button>

              <p className="text-[10px] text-center text-[#a0af9e]/40 leading-relaxed">{t.generator.disclaimer}</p>
            </div>
          </div>
        </aside>
      </div>

    </PageWrapper>

    {showFoodSearch && (
      <FoodSearchModal
        mealType={generatorInput.mealType}
        onClose={() => setShowFoodSearch(false)}
      />
    )}
    </>
  )
}
