import { Link } from 'react-router-dom'
import { ChefHat, Plus } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/store'

const MACRO_CONFIG = [
  { key: 'calories' as const, label: 'Calories', unit: 'kcal', color: '#4ade80' },
  { key: 'protein'  as const, label: 'Protein',  unit: 'g',    color: '#3b82f6' },
  { key: 'carbs'    as const, label: 'Carbs',    unit: 'g',    color: '#f59e0b' },
  { key: 'fat'      as const, label: 'Fat',      unit: 'g',    color: '#a78bfa' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDay() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const GOAL_LABEL: Record<string, string> = {
  lose: 'Lose Weight',
  gain: 'Gain Muscle',
  maintain: 'Maintain',
}

export default function Dashboard() {
  const { profile, macroTargets, dailyLog, getRemainingMacros } = useStore()
  const remaining = getRemainingMacros()
  const totals = dailyLog?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }

  return (
    <PageWrapper className="bg-[#0d1a0f] text-white">

      {/* Greeting */}
      <div className="mb-6">
        <p className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold mb-1">{formatDay()}</p>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none mb-3">
          {greeting()},<br />{profile?.name.split(' ')[0] ?? 'there'}.
        </h1>
        {profile?.goal && (
          <span className="inline-block text-[10px] tracking-[2px] uppercase font-bold px-3 py-1 rounded-full bg-[#0d2a12] border border-[#1a3a1f] text-[#4ade80]">
            {GOAL_LABEL[profile.goal]}
          </span>
        )}
      </div>

      {/* Macro cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {MACRO_CONFIG.map(({ key, label, unit, color }) => {
          const consumed = totals[key]
          const target = macroTargets?.[key] ?? 0
          const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0
          const rem = remaining[key]

          return (
            <div key={key} className="bg-[#0d2a12] border border-[#1a3a1f] rounded-xl p-4">
              <p className="text-[10px] tracking-[3px] uppercase font-bold mb-2" style={{ color }}>
                {label}
              </p>
              <p className="text-2xl font-black text-white leading-none mb-1">
                {consumed}
                <span className="text-xs font-normal text-[#4ade80] ml-1">{unit}</span>
              </p>
              <p className="text-[10px] text-[#2d5a35] mb-2">of {target} {unit}</p>

              {/* Progress bar */}
              <div className="h-1 w-full bg-[#1a3a1f] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>

              <p className="text-[10px] text-[#4ade80] mt-1.5">{rem} {unit} left</p>
            </div>
          )
        })}
      </div>

      {/* Generate CTA */}
      <Link
        to="/generate"
        className="flex items-center justify-between w-full bg-[#4ade80] text-[#0d1a0f] rounded-xl px-5 py-4 mb-6 hover:bg-[#86efac] transition-colors"
      >
        <div>
          <p className="font-black uppercase tracking-widest text-sm">Generate a Recipe</p>
          <p className="text-[10px] mt-0.5 text-[#0d3a18]">Tailored to your remaining macros</p>
        </div>
        <ChefHat size={24} />
      </Link>

      {/* Today's meals */}
      <div>
        <p className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold mb-3">Today's Meals</p>

        {!dailyLog || dailyLog.meals.length === 0 ? (
          <div className="bg-[#0d2a12] border border-[#1a3a1f] rounded-xl p-6 text-center">
            <p className="text-[#2d5a35] text-sm font-medium">No meals logged yet.</p>
            <p className="text-[#2d5a35] text-xs mt-1">Generate a recipe and log it here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dailyLog.meals.map((meal, i) => (
              <div key={i} className="bg-[#0d2a12] border border-[#1a3a1f] rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">{meal.recipeTitle}</p>
                  <p className="text-[10px] text-[#4ade80] mt-0.5 capitalize">{meal.mealType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">{meal.nutrition.calories} <span className="text-[10px] font-normal text-[#4ade80]">kcal</span></p>
                  <p className="text-[10px] text-[#2d5a35]">P {meal.nutrition.protein}g · C {meal.nutrition.carbs}g · F {meal.nutrition.fat}g</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/generate"
          className="mt-3 flex items-center justify-center gap-2 w-full border border-[#1a3a1f] text-[#4ade80] rounded-xl py-3 text-sm font-bold uppercase tracking-widest hover:border-[#4ade80] transition-colors"
        >
          <Plus size={16} /> Log a Meal
        </Link>
      </div>

    </PageWrapper>
  )
}
