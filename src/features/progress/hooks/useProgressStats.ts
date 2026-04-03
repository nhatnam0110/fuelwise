import { useMemo } from 'react'
import { Trophy, Footprints, Calendar, Zap, Flame, Gem, Dumbbell, Star, TrendingDown } from 'lucide-react'
import { useStore } from '@/state'
import { useT } from '@/hooks/useT'
import type { Milestone } from '@/features/progress/components/MilestonesGrid'

type Filter = '7d' | '30d' | 'all'

function formatChartDate(ts: number, language: 'en' | 'vi') {
  return new Date(ts).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric' })
}

export function useProgressStats(filter: Filter, tp: ReturnType<typeof useT>['progress']) {
  const { profile, weightEntries, goalWeight, language } = useStore()

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

  return {
    sortedEntries, currentWeight, weeklyChange,
    goalPct, chartData, yDomain,
    milestones, earnedCount,
    startWeight, language,
  }
}
