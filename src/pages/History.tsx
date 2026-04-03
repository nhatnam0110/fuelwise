import { useState, useMemo } from 'react'
import { UtensilsCrossed } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/state'
import { useT } from '@/hooks/useT'
import { DayCard } from '@/features/history/components/DayCard'

type Filter = '7d' | '30d' | '90d' | 'all'

export default function History() {
  const { logHistory, macroTargets } = useStore()
  const t = useT()
  const tf = t.history

  const [filter, setFilter] = useState<Filter>('30d')

  const filtered = useMemo(() => {
    const now = new Date()
    const cutoff = new Date(now)
    if (filter === '7d')  cutoff.setDate(now.getDate() - 7)
    if (filter === '30d') cutoff.setDate(now.getDate() - 30)
    if (filter === '90d') cutoff.setDate(now.getDate() - 90)

    const sorted = [...logHistory].sort((a, b) => b.date.localeCompare(a.date))
    if (filter === 'all') return sorted
    return sorted.filter((d) => d.date >= cutoff.toISOString().split('T')[0])
  }, [logHistory, filter])

  const filterKeys: Filter[] = ['7d', '30d', '90d', 'all']

  return (
    <PageWrapper className="text-white min-h-screen pt-24 pb-28 md:pb-12 px-4 md:px-12 lg:px-24">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <header>
          <h1 className="font-black text-4xl md:text-5xl uppercase tracking-tighter text-white">
            {tf.title}
          </h1>
          <p className="text-[#a0af9e] text-sm mt-2">{tf.subtitle}</p>
        </header>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {filterKeys.map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                filter === key
                  ? 'bg-[#4ade80] text-[#051107]'
                  : 'bg-[#0d1d10] text-[#a0af9e] border border-[#172a1a] hover:border-[#4ade80]/40'
              }`}
            >
              {tf.filters[key]}
            </button>
          ))}
        </div>

        {/* Day list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <UtensilsCrossed size={40} className="text-[#3d4b3e]" />
            <p className="text-[#a0af9e] text-sm">{tf.noHistory}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((log) => (
              <DayCard key={log.date} log={log} macroTargets={macroTargets} t={t} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
