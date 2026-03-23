import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { useT } from '@/hooks/useT'
import { PageWrapper } from '@/components/layout/PageWrapper'

export default function Result() {
  const navigate = useNavigate()
  const t = useT()
  const { currentRecipe, saveRecipe, savedRecipes, logMeal } = useStore()

  if (!currentRecipe) {
    navigate('/generate')
    return null
  }

  const isSaved = savedRecipes.some((r) => r.id === currentRecipe.id)

  function handleSave() {
    if (currentRecipe) saveRecipe(currentRecipe)
  }

  function handleLog() {
    if (!currentRecipe) return
    logMeal({
      recipeId: currentRecipe.id,
      recipeTitle: currentRecipe.title,
      nutrition: currentRecipe.nutrition,
      mealType: currentRecipe.mealType,
      loggedAt: Date.now(),
    })
    navigate('/dashboard')
  }

  const { title, description, cuisine, cookTime, servings, mealType, ingredients, steps, nutrition, dietaryTags, macroFitScore } = currentRecipe

  const macroFitColor =
    (macroFitScore ?? 0) >= 80 ? 'text-[#4ade80]' :
    (macroFitScore ?? 0) >= 50 ? 'text-yellow-400' : 'text-red-400'

  return (
    <PageWrapper className="bg-[#051107] text-white pt-24 px-4 md:px-12 lg:px-24 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back */}
        <button onClick={() => navigate('/generate')} className="flex items-center gap-2 text-[#a0af9e] hover:text-white transition-colors text-sm">
          {t.result.backToGenerator}
        </button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] uppercase tracking-widest font-bold bg-[#4ade80]/10 text-[#4ade80] px-3 py-1 rounded-full">{mealType}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold bg-[#172a1a] text-[#a0af9e] px-3 py-1 rounded-full">{cuisine}</span>
            {dietaryTags?.map((tag) => (
              <span key={tag} className="text-[10px] uppercase tracking-widest font-bold bg-[#172a1a] text-[#a0af9e] px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">{title}</h1>
          <p className="text-[#a0af9e] text-lg max-w-2xl">{description}</p>
          <div className="flex gap-6 text-sm text-[#a0af9e] pt-1">
            <span>⏱ {cookTime}</span>
            <span>🍽 {servings} {t.common.serving}</span>
            {macroFitScore != null && (
              <span className={`font-bold ${macroFitColor}`}>{t.result.macroFit}: {macroFitScore}/100</span>
            )}
          </div>
        </motion.div>

        {/* Nutrition */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.common.calories, value: nutrition.calories, unit: t.common.kcal, color: 'text-[#4ade80]' },
            { label: t.common.protein,  value: nutrition.protein,  unit: 'g',           color: 'text-[#699cff]' },
            { label: t.common.carbs,    value: nutrition.carbs,    unit: 'g',           color: 'text-yellow-400' },
            { label: t.common.fat,      value: nutrition.fat,      unit: 'g',           color: 'text-purple-400' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-[#0d1d10] rounded-2xl p-5 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-[#a0af9e] font-bold">{label}</p>
              <p className={`text-3xl font-black ${color}`}>{value}<span className="text-sm font-normal text-[#a0af9e] ml-1">{unit}</span></p>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-[#0d1d10] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#4ade80]">{t.result.ingredients}</h2>
            <ul className="space-y-3">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between items-center border-b border-[#172a1a] pb-2 last:border-0 last:pb-0">
                  <span className="text-white font-medium">{ing.name}</span>
                  <span className="text-[#a0af9e] text-sm">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-[#0d1d10] rounded-2xl p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-black text-[#4ade80]">{t.result.instructions}</h2>
            <ol className="space-y-4">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#172a1a] text-[#4ade80] text-xs font-black flex items-center justify-center mt-0.5">{i + 1}</span>
                  <p className="text-[#a0af9e] leading-relaxed text-sm">{step}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-col sm:flex-row gap-4 pt-2">
          <button onClick={handleLog}
            className="flex-1 py-4 bg-gradient-to-br from-[#4ade80] to-[#19be64] text-[#051107] font-black uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-95 transition-all">
            {t.result.logMeal}
          </button>
          <button onClick={handleSave} disabled={isSaved}
            className="flex-1 py-4 border-2 border-[#4ade80]/30 text-[#4ade80] font-black uppercase tracking-widest rounded-full hover:border-[#4ade80] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isSaved ? t.result.savedCheck : t.result.saveRecipe}
          </button>
          <button onClick={() => navigate('/generate')}
            className="flex-1 py-4 bg-[#0d1d10] text-[#a0af9e] font-black uppercase tracking-widest rounded-full hover:text-white transition-all">
            {t.result.tryAnother}
          </button>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(title + ' recipe')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 flex-1 py-4 bg-[#0d1d10] text-[#a0af9e] font-black uppercase tracking-widest rounded-full hover:text-white transition-all">
            <ExternalLink size={16} /> Search Online
          </a>
        </motion.div>

      </div>
    </PageWrapper>
  )
}
