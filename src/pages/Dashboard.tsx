import { Link, useNavigate } from 'react-router-dom'
import { Trash2, PlusCircle, UtensilsCrossed } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/store'
import { useT } from '@/hooks/useT'

function formatDay(language: 'en' | 'vi') {
  return new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })
}

// SVG circle ring math
const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function CalorieRing({ consumed, target, label, of: ofLabel, kcal }: {
  consumed: number; target: number; label: string; of: string; kcal: string
}) {
  const pct = target > 0 ? Math.min(1, consumed / target) : 0
  const remaining = Math.max(0, target - consumed)
  const offset = CIRCUMFERENCE * (1 - pct)

  return (
    <div className="relative w-56 h-56 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={RADIUS} fill="transparent"
          stroke="#172a1a" strokeWidth="8" />
        <circle cx="50" cy="50" r={RADIUS} fill="transparent"
          stroke="#4ade80" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out', filter: 'drop-shadow(0 0 8px rgba(74,222,128,0.4))' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs uppercase tracking-widest text-[#a0af9e]">{label}</span>
        <span className="text-4xl font-black text-white">{remaining.toLocaleString()}</span>
        <span className="text-xs text-[#a0af9e]">{ofLabel} {target.toLocaleString()} {kcal}</span>
      </div>
    </div>
  )
}

function MacroBar({ label, consumed, target, color }: {
  label: string; consumed: number; target: number; color: string
}) {
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="font-bold text-base text-white">{label}</span>
        <span className="text-sm text-[#a0af9e]">
          <span className="font-bold" style={{ color }}>{consumed}g</span> / {target}g
        </span>
      </div>
      <div className="h-2.5 w-full bg-[#172a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { profile, macroTargets, dailyLog, getRemainingMacros, deleteLoggedMeal, language } = useStore()
  const navigate = useNavigate()
  const t = useT()
  const remaining = getRemainingMacros()
  const totals = dailyLog?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }

  function greeting() {
    const h = new Date().getHours()
    if (h < 12) return t.dashboard.goodMorning
    if (h < 17) return t.dashboard.goodAfternoon
    return t.dashboard.goodEvening
  }

  return (
    <PageWrapper className="bg-[#051107] text-white">
      <div className="pt-20 px-4 md:px-10 lg:px-20 max-w-7xl mx-auto pb-28 md:pb-12 space-y-10">

        {/* Hero */}
        <section className="mt-6 space-y-1">
          <p className="text-[#4ade80] font-bold tracking-widest uppercase text-xs">{formatDay(language)}</p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
            {greeting()}, {profile?.name?.split(' ')[0] ?? 'there'}.
          </h1>
          {profile?.goal && (
            <p className="text-[#a0af9e] text-base mt-1">
              {t.dashboard.goal(t.dashboard.goalLabels[profile.goal as keyof typeof t.dashboard.goalLabels])}
            </p>
          )}
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Nutrition overview */}
          <div className="lg:col-span-8 bg-[#0d1d10] rounded-[2rem] p-8 flex flex-col md:flex-row gap-10 items-center"
            style={{ boxShadow: '0 0 40px -10px rgba(74,222,128,0.15)' }}>
            <CalorieRing consumed={totals.calories} target={macroTargets?.calories ?? 2000} label={t.dashboard.remaining} of={t.common.of} kcal={t.common.kcal} />
            <div className="w-full space-y-6">
              <MacroBar label={t.common.protein} consumed={totals.protein} target={macroTargets?.protein ?? 0} color="#699cff" />
              <MacroBar label={t.common.carbs}   consumed={totals.carbs}   target={macroTargets?.carbs   ?? 0} color="#facc15" />
              <MacroBar label={t.common.fat}     consumed={totals.fat}     target={macroTargets?.fat     ?? 0} color="#c084fc" />
            </div>
          </div>

          {/* Generate CTA */}
          <div className="lg:col-span-4 relative rounded-[2rem] p-8 flex flex-col justify-between border border-[#4ade80]/10 overflow-hidden group"
            style={{ background: 'rgba(23,42,26,0.6)', backdropFilter: 'blur(20px)' }}>
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#4ade80]/20 rounded-full blur-3xl group-hover:bg-[#4ade80]/30 transition-all" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#4ade80]/20 rounded-xl flex items-center justify-center text-[#4ade80] mb-6">
                <UtensilsCrossed size={22} />
              </div>
              <h3 className="text-2xl font-black leading-tight mb-3 text-white whitespace-pre-line">
                {t.dashboard.generateCTA}
              </h3>
              <p className="text-[#a0af9e] leading-relaxed text-sm">{t.dashboard.generateDesc}</p>
              <p className="text-[#4ade80] font-bold text-sm mt-3">
                {t.dashboard.kcalRemaining(remaining.calories)}
              </p>
            </div>
            <button
              onClick={() => navigate('/generate')}
              className="relative z-10 mt-8 w-full py-4 px-6 font-black rounded-full text-center transition-all active:scale-95 text-[#052108]"
              style={{ background: 'linear-gradient(135deg, #4ade80, #19be64)', boxShadow: '0 0 20px rgba(74,222,128,0.25)' }}
            >
              {t.dashboard.generateBtn}
            </button>
          </div>

          {/* Today's Meals */}
          <div className="lg:col-span-12 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-white">{t.dashboard.todayMeals}</h2>
              <Link
                to="/generate"
                className="flex items-center gap-2 text-[#4ade80] font-bold text-sm hover:bg-[#4ade80]/10 px-4 py-2 rounded-lg transition-all"
              >
                <PlusCircle size={18} /> {t.dashboard.logMeal}
              </Link>
            </div>

            {!dailyLog || dailyLog.meals.length === 0 ? (
              <div className="flex items-center justify-between p-6 border-2 border-dashed border-[#1a3a1f] rounded-3xl opacity-60">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0d1d10] flex items-center justify-center text-[#a0af9e]">
                    <UtensilsCrossed size={24} />
                  </div>
                  <div>
                    <p className="font-black text-[#a0af9e]">{t.dashboard.noMeals}</p>
                    <p className="text-[#a0af9e] text-sm">{t.dashboard.noMealsHint}</p>
                  </div>
                </div>
                <Link
                  to="/generate"
                  className="bg-[#0d1d10] text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-[#172a1a] transition-all"
                >
                  {t.dashboard.addMeal}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyLog.meals.map((meal, i) => (
                  <div key={i}
                    className="flex items-center justify-between p-5 bg-[#08160b] rounded-3xl hover:bg-[#0d1d10] transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#0d1d10] flex items-center justify-center text-[#4ade80]">
                        <UtensilsCrossed size={20} />
                      </div>
                      <div>
                        <p className="font-black text-white">{meal.recipeTitle}</p>
                        <p className="text-[#a0af9e] text-xs capitalize mt-0.5">{meal.mealType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="hidden md:flex gap-5 text-xs text-[#a0af9e]">
                        <div><span className="block font-bold text-white">{meal.nutrition.protein}g</span> P</div>
                        <div><span className="block font-bold text-white">{meal.nutrition.carbs}g</span> C</div>
                        <div><span className="block font-bold text-white">{meal.nutrition.fat}g</span> F</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-[#4ade80]">{meal.nutrition.calories}</span>
                        <span className="text-xs text-[#a0af9e] block">kcal</span>
                      </div>
                      <button onClick={() => deleteLoggedMeal(meal.loggedAt)} className="text-[#a0af9e] hover:text-red-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </PageWrapper>
  )
}

