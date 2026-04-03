import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useT } from '@/hooks/useT'
import type { DailyLog } from '@/types/log'

function macroBar(value: number, max: number, color: string) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-1 w-full bg-[#172a1a] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function DayCard({ log, macroTargets, t }: {
  log: DailyLog
  macroTargets: { calories: number; protein: number; carbs: number; fat: number } | null
  t: ReturnType<typeof useT>
}) {
  const [expanded, setExpanded] = useState(false)
  const tf = t.history
  const tc = t.common

  const date = new Date(log.date + 'T00:00:00')
  const dateLabel = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="bg-[#0d1d10]/80 backdrop-blur-sm rounded-2xl border border-[#172a1a] overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#172a1a]/40 transition-all"
      >
        <div className="text-left">
          <p className="text-white font-black text-sm">{dateLabel}</p>
          <p className="text-[#a0af9e] text-[11px] mt-0.5">
            {log.meals.length} {tf.meals}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex gap-5 text-xs">
            <span className="text-[#4ade80] font-black">{log.totals.calories} kcal</span>
            <span className="text-[#699cff]">{log.totals.protein}g P</span>
            <span className="text-[#facc15]">{log.totals.carbs}g C</span>
            <span className="text-[#c084fc]">{log.totals.fat}g F</span>
          </div>
          <span className="text-[#4ade80] sm:hidden text-xs font-black">{log.totals.calories} kcal</span>
          {expanded
            ? <ChevronUp size={16} className="text-[#a0af9e] flex-shrink-0" />
            : <ChevronDown size={16} className="text-[#a0af9e] flex-shrink-0" />
          }
        </div>
      </button>

      {macroTargets && (
        <div className="px-5 pb-3 grid grid-cols-4 gap-3">
          {[
            { label: tc.calories, value: log.totals.calories, max: macroTargets.calories, color: '#4ade80' },
            { label: tc.protein,  value: log.totals.protein,  max: macroTargets.protein,  color: '#699cff' },
            { label: tc.carbs,    value: log.totals.carbs,    max: macroTargets.carbs,    color: '#facc15' },
            { label: tc.fat,      value: log.totals.fat,      max: macroTargets.fat,      color: '#c084fc' },
          ].map(({ label, value, max, color }) => (
            <div key={label}>
              <p className="text-[9px] text-[#a0af9e] uppercase tracking-widest mb-1">{label}</p>
              {macroBar(value, max, color)}
            </div>
          ))}
        </div>
      )}

      {expanded && (
        <div className="border-t border-[#172a1a] divide-y divide-[#172a1a]">
          {log.meals.length === 0 ? (
            <p className="px-5 py-4 text-[#a0af9e] text-sm">No meals logged this day.</p>
          ) : (
            log.meals.map((meal, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{meal.recipeTitle}</p>
                  <p className="text-[#a0af9e] text-[11px] mt-0.5 capitalize">{meal.mealType}</p>
                </div>
                <div className="flex gap-3 text-xs flex-shrink-0">
                  <span className="text-[#4ade80] font-bold">{meal.nutrition.calories} kcal</span>
                  <span className="text-[#699cff] hidden sm:inline">{meal.nutrition.protein}g P</span>
                  <span className="text-[#facc15] hidden sm:inline">{meal.nutrition.carbs}g C</span>
                  <span className="text-[#c084fc] hidden sm:inline">{meal.nutrition.fat}g F</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
