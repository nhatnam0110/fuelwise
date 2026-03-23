import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { useT } from '@/hooks/useT'
import { PageWrapper } from '@/components/layout/PageWrapper'
import type { Recipe } from '@/types/recipe'

const FILTER_IDS = ['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const
type Filter = (typeof FILTER_IDS)[number]

export default function Saved() {
  const navigate = useNavigate()
  const t = useT()
  const { savedRecipes, deleteRecipe, setCurrentRecipe } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtered = filter === 'all'
    ? savedRecipes
    : savedRecipes.filter((r) => r.mealType === filter)

  const sorted = [...filtered].sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))

  const filterLabels: Record<Filter, string> = {
    all: t.common.all,
    breakfast: t.common.breakfast,
    lunch: t.common.lunch,
    dinner: t.common.dinner,
    snack: t.common.snack,
  }

  function handleView(recipe: Recipe) {
    setCurrentRecipe(recipe)
    navigate(`/recipe/${recipe.id}`)
  }

  function handleDelete(id: string) {
    deleteRecipe(id)
    setConfirmDelete(null)
  }

  const macroFitColor = (score?: number) =>
    !score ? 'text-[#a0af9e]' :
    score >= 80 ? 'text-[#4ade80]' :
    score >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <PageWrapper className="bg-[#051107] text-white pt-24 px-4 md:px-12 lg:px-24 pb-12">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.4em] font-black text-[#4ade80]">{t.saved.collection}</p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{t.saved.title}</h1>
          <p className="text-[#a0af9e]">{t.saved.count(savedRecipes.length)}</p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_IDS.map((id) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-5 py-2 rounded-full text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                filter === id
                  ? 'bg-[#4ade80] text-[#051107]'
                  : 'bg-[#0d1d10] text-[#a0af9e] hover:text-white'
              }`}>
              {filterLabels[id]}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0d1d10] flex items-center justify-center text-3xl">🍽</div>
            <p className="text-[#a0af9e] text-lg font-medium">
              {filter === 'all' ? t.saved.emptyAll : t.saved.empty(filterLabels[filter])}
            </p>
            <button onClick={() => navigate('/generate')}
              className="px-6 py-3 bg-[#4ade80] text-[#051107] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all text-sm">
              {t.saved.generateBtn}
            </button>
          </div>
        )}

        {/* Recipe grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {sorted.map((recipe) => (
              <motion.div key={recipe.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0d1d10] rounded-2xl overflow-hidden border border-[#172a1a] hover:border-[#4ade80]/30 transition-all group flex flex-col">

                <div className="p-5 space-y-3 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-[#4ade80]/10 text-[#4ade80] px-2 py-0.5 rounded-full">
                        {filterLabels[recipe.mealType as Filter] ?? recipe.mealType}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest font-bold bg-[#172a1a] text-[#a0af9e] px-2 py-0.5 rounded-full">
                        {recipe.cuisine}
                      </span>
                    </div>
                    {recipe.macroFitScore != null && (
                      <span className={`text-xs font-black ${macroFitColor(recipe.macroFitScore)} flex-shrink-0`}>
                        {recipe.macroFitScore}/100
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-lg leading-tight tracking-tight group-hover:text-[#4ade80] transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-[#a0af9e] text-sm line-clamp-2">{recipe.description}</p>
                  <div className="flex gap-4 text-xs text-[#a0af9e]">
                    <span>⏱ {recipe.cookTime}</span>
                    <span>🍽 {recipe.servings} {t.common.serving}</span>
                  </div>
                </div>

                {/* Nutrition bar */}
                <div className="px-5 pb-4 grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: t.common.kcal,    value: recipe.nutrition.calories,          color: 'text-[#4ade80]' },
                    { label: t.common.protein.slice(0,1), value: `${recipe.nutrition.protein}g`, color: 'text-[#699cff]' },
                    { label: t.common.carbs.slice(0,1),   value: `${recipe.nutrition.carbs}g`,   color: 'text-yellow-400' },
                    { label: t.common.fat.slice(0,1),     value: `${recipe.nutrition.fat}g`,     color: 'text-purple-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#172a1a] rounded-lg py-2">
                      <p className={`text-sm font-black ${color}`}>{value}</p>
                      <p className="text-[9px] uppercase tracking-wider text-[#a0af9e]">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="px-5 pb-5 flex gap-2">
                  <button onClick={() => handleView(recipe)}
                    className="flex-1 py-2.5 bg-[#4ade80] text-[#051107] font-black uppercase tracking-widest text-xs rounded-full hover:scale-105 active:scale-95 transition-all">
                    {t.saved.view}
                  </button>
                  <button onClick={() => setConfirmDelete(recipe.id)}
                    className="px-4 py-2.5 bg-[#172a1a] text-[#a0af9e] hover:text-red-400 hover:bg-red-400/10 font-bold text-xs rounded-full transition-all">
                    {t.common.delete}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d1d10] border border-[#172a1a] rounded-2xl p-8 max-w-sm w-full space-y-6 text-center">
              <p className="font-black text-xl tracking-tight">{t.saved.confirmDelete}</p>
              <p className="text-[#a0af9e] text-sm">{t.saved.confirmDeleteDesc}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 bg-[#172a1a] text-white font-bold rounded-full hover:bg-[#1d3120] transition-all">
                  {t.common.cancel}
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 bg-red-500/20 text-red-400 font-bold rounded-full hover:bg-red-500/30 transition-all">
                  {t.common.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
