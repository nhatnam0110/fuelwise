import { useState } from 'react'
import { Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/state'
import { useT } from '@/hooks/useT'
import { useProgressStats } from '@/features/progress/hooks/useProgressStats'
import { GoalCard } from '@/features/progress/components/GoalCard'
import { WeightChart } from '@/features/progress/components/WeightChart'
import { MilestonesGrid } from '@/features/progress/components/MilestonesGrid'
import { WeightHistory } from '@/features/progress/components/WeightHistory'
import { WeightModal } from '@/features/progress/components/WeightModal'

type Filter = '7d' | '30d' | 'all'

export default function Progress() {
  const { weightEntries, goalWeight, logWeight, deleteWeight, setGoalWeight } = useStore()
  const t = useT()
  const tp = t.progress

  const [filter, setFilter] = useState<Filter>('30d')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'consistency' | 'weight'>('all')
  const [showModal, setShowModal] = useState(false)

  const {
    currentWeight, weeklyChange,
    goalPct, chartData, yDomain,
    milestones, earnedCount,
    startWeight, language,
  } = useProgressStats(filter, tp)

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
          <GoalCard goalWeight={goalWeight} goalPct={goalPct} currentWeight={currentWeight} tp={tp} onSetGoal={setGoalWeight} />
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
