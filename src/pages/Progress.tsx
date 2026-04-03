import { useState, useMemo } from 'react'
import { Plus, TrendingDown, TrendingUp, Minus, Trophy, Footprints, Calendar, Zap, Flame, Gem, Dumbbell, Star } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/state'
import { useT } from '@/hooks/useT'
import { GoalCard } from '@/features/progress/components/GoalCard'
import { WeightChart } from '@/features/progress/components/WeightChart'
import { MilestonesGrid } from '@/features/progress/components/MilestonesGrid'
import { WeightHistory } from '@/features/progress/components/WeightHistory'
import { WeightModal } from '@/features/progress/components/WeightModal'
import type { Milestone } from '@/features/progress/components/MilestonesGrid'

type Filter = '7d' | '30d' | 'all'

function formatChartDate(ts: number, language: 'en' | 'vi') {
  return new Date(ts).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' })
}

export default function Progress() {
  const { profile, weightEntries, goalWeight, logWeight, deleteWeight, setGoalWeight, language } = useStore()
  const t = useT()
  const tp = t.progress

  const [filter, setFilter] = useState<Filter>('30d')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'consistency' | 'weight'>('all')
  const [showModal, setShowModal] = useState(false)

  const startWeight = profile?.weight ?? 0
  const isLose = profile?.goal === 'lose'
  const isGain = profile?.goal === 'gain'

  const sortedEntries = useMemo(
    () => [...weightEntries].sort((a, b) => a.loggedAt - b.loggedAt),
    [weightEntries]
  )

  const currentWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : startWeight
  const weekAgo = sortedEntries.findLast((e) => Date.now() - e.loggedAt >= 7 * 86400000)
  const weeklyChange = weekAgo ? currentWeight - weekAgo.weight : null
  const totalChange = currentWeight - startWeight
  const progressChange = isLose ? -totalChange : totalChange

  const goalPct = goalWeight
    ? Math.min(100, Math.max(0, Math.round((progressChange / Math.abs(startWeight - goalWeight)) * 100)))
    : 0

  const allChartData = useMemo(() => {
    const base = { date: 'Start', weight: startWeight, loggedAt: 0 }
    return [base, ...sortedEntries.map((e) => ({ date: formatChartDate(e.loggedAt, language), weight: e.weight, loggedAt: e.loggedAt }))]
  }, [sortedEntries, startWeight, language])

  const chartData = useMemo(() => {
    if (filter === 'all') return allChartData
    const cutoff = Date.now() - (filter === '7d' ? 7 : 30) * 86400000
    return allChartData.filter((e) => e.loggedAt === 0 || e.loggedAt >= cutoff)
  }, [allChartData, filter])

  const yDomain = useMemo(() => {
    const weights = chartData.map((d) => d.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const pad = Math.max(1, (max - min) * 0.3)
    return [Math.floor(min - pad), Math.ceil(max + pad)] as [number, number]
  }, [chartData])

  const milestones = useMemo((): Milestone[] => {
    const ml = tp.milestoneList
    const earned = (condition: boolean, entryIdx?: number) => ({
      earned: condition,
      earnedAt: condition && entryIdx !== undefined ? sortedEntries[entryIdx]?.loggedAt : undefined,
    })
    const base: Milestone[] = [
      { ...ml.firstStep,  Icon: Footprints, color: '#4ade80', category: 'consistency', ...earned(sortedEntries.length >= 1, 0) },
      { ...ml.consistent, Icon: Calendar,   color: '#699cff', category: 'consistency', ...earned(sortedEntries.length >= 5) },
      { ...ml.halfway,    Icon: Zap,        color: '#facc15', category: 'weight',      ...earned(goalWeight != null && goalPct >= 50) },
      { ...ml.goalHit,    Icon: Trophy,     color: '#4ade80', category: 'weight',      ...earned(goalWeight != null && goalPct >= 100) },
    ]
    if (isLose) return [...base,
      { ...ml.lost1, Icon: TrendingDown, color: '#4ade80', category: 'weight', ...earned(-totalChange >= 1) },
      { ...ml.lost3, Icon: Flame,        color: '#fb923c', category: 'weight', ...earned(-totalChange >= 3) },
      { ...ml.lost5, Icon: Gem,          color: '#c084fc', category: 'weight', ...earned(-totalChange >= 5) },
    ]
    if (isGain) return [...base,
      { ...ml.gained1, Icon: Dumbbell, color: '#4ade80', category: 'weight', ...earned(totalChange >= 1) },
      { ...ml.gained3, Icon: Star,     color: '#fb923c', category: 'weight', ...earned(totalChange >= 3) },
    ]
    return base
  }, [sortedEntries, totalChange, goalPct, goalWeight, isLose, isGain, tp.milestoneList])

  const earnedCount = milestones.filter((m) => m.earned).length

  return (
    <PageWrapper className="text-white">
      <div className="pt-20 px-4 md:px-10 lg:px-20 max-w-5xl mx-auto pb-32 md:pb-16 space-y-10">

        {/* Hero + Goal */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7 space-y-4">
            <p className="text-[#4ade80] font-bold tracking-widest uppercase text-xs">{tp.currentWeight}</p>
            <div className="flex items-end gap-3">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">{currentWeight.toFixed(1)}</h1>
              <span className="text-3xl text-[#4ade80] font-black mb-2">kg</span>
            </div>
            {weeklyChange !== null && (
              <div className={`flex items-center gap-2 text-sm font-bold ${weeklyChange < 0 ? 'text-[#4ade80]' : weeklyChange > 0 ? 'text-red-400' : 'text-[#a0af9e]'}`}>
                {weeklyChange < 0 ? <TrendingDown size={16} /> : weeklyChange > 0 ? <TrendingUp size={16} /> : <Minus size={16} />}
                {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)}kg this week
              </div>
            )}
          </div>
          <GoalCard
            goalWeight={goalWeight}
            goalPct={goalPct}
            currentWeight={currentWeight}
            tp={tp}
            onSetGoal={setGoalWeight}
          />
        </section>

        <WeightChart chartData={chartData} filter={filter} onFilterChange={setFilter} yDomain={yDomain} tp={tp} />

        <MilestonesGrid
          milestones={milestones}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          earnedCount={earnedCount}
          language={language}
          tp={tp}
        />

        <WeightHistory entries={weightEntries} startWeight={startWeight} language={language} tp={tp} onDelete={deleteWeight} />
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-[#051107] shadow-[0_8px_30px_rgba(74,222,128,0.4)] active:scale-95 transition-transform z-40"
        style={{ background: 'linear-gradient(135deg, #4ade80, #19be64)' }}
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {showModal && (
        <WeightModal
          onClose={() => setShowModal(false)}
          onLog={(w, note) => { logWeight(w, note); setShowModal(false) }}
          labels={{
            title: tp.logWeight,
            weightLabel: tp.weightLabel,
            weightPlaceholder: tp.weightPlaceholder,
            noteLabel: tp.noteLabel,
            notePlaceholder: tp.notePlaceholder,
            save: tp.save,
            cancel: t.common.cancel,
          }}
        />
      )}
    </PageWrapper>
  )
}
