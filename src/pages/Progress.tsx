import { useState, useMemo } from 'react'
import { Plus, Trash2, TrendingDown, TrendingUp, Minus, Trophy, Target, Lock, Footprints, Calendar, Zap, Flame, Gem, Dumbbell, Star } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/store'
import { useT } from '@/hooks/useT'

type Filter = '7d' | '30d' | 'all'

function formatChartDate(ts: number, language: 'en' | 'vi') {
  return new Date(ts).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short', day: 'numeric',
  })
}

function formatHistoryDate(ts: number, language: 'en' | 'vi') {
  return new Date(ts).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export default function Progress() {
  const { profile, weightEntries, goalWeight, logWeight, deleteWeight, setGoalWeight, language } = useStore()
  const t = useT()
  const tp = t.progress

  const [filter, setFilter] = useState<Filter>('30d')
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'consistency' | 'weight'>('all')
  const [showModal, setShowModal] = useState(false)
  const [inputWeight, setInputWeight] = useState('')
  const [inputNote, setInputNote] = useState('')
  const [goalInput, setGoalInput] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)

  const startWeight = profile?.weight ?? 0

  const sortedEntries = useMemo(
    () => [...weightEntries].sort((a, b) => a.loggedAt - b.loggedAt),
    [weightEntries]
  )

  const allChartData = useMemo(() => {
    const base = { date: 'Start', weight: startWeight, loggedAt: 0 }
    return [
      base,
      ...sortedEntries.map((e) => ({
        date: formatChartDate(e.loggedAt, language),
        weight: e.weight,
        loggedAt: e.loggedAt,
      })),
    ]
  }, [sortedEntries, startWeight, language])

  const chartData = useMemo(() => {
    if (filter === 'all') return allChartData
    const cutoff = Date.now() - (filter === '7d' ? 7 : 30) * 86400000
    return allChartData.filter((e) => e.loggedAt === 0 || e.loggedAt >= cutoff)
  }, [allChartData, filter])

  const currentWeight = sortedEntries.length > 0
    ? sortedEntries[sortedEntries.length - 1].weight
    : startWeight

  const weekAgo = sortedEntries.findLast((e) => Date.now() - e.loggedAt >= 7 * 86400000)
  const weeklyChange = weekAgo ? currentWeight - weekAgo.weight : null

  const totalChange = currentWeight - startWeight // negative = loss, positive = gain
  const isLose = profile?.goal === 'lose'
  const isGain = profile?.goal === 'gain'
  const progressChange = isLose ? -totalChange : totalChange // positive = good progress

  const goalPct = goalWeight
    ? Math.min(100, Math.max(0, Math.round((progressChange / Math.abs(startWeight - goalWeight)) * 100)))
    : 0

  // --- Milestones ---
  const milestones = useMemo(() => {
    const ml = tp.milestoneList
    const earned = (condition: boolean, entryIdx?: number) => ({
      earned: condition,
      earnedAt: condition && entryIdx !== undefined ? sortedEntries[entryIdx]?.loggedAt : undefined,
    })

    const base = [
      { ...ml.firstStep,  Icon: Footprints, color: '#4ade80', category: 'consistency' as const, ...earned(sortedEntries.length >= 1, 0) },
      { ...ml.consistent, Icon: Calendar,   color: '#699cff', category: 'consistency' as const, ...earned(sortedEntries.length >= 5) },
      { ...ml.halfway,    Icon: Zap,        color: '#facc15', category: 'weight'      as const, ...earned(goalWeight != null && goalPct >= 50) },
      { ...ml.goalHit,    Icon: Trophy,     color: '#4ade80', category: 'weight'      as const, ...earned(goalWeight != null && goalPct >= 100) },
    ]

    if (isLose) {
      return [
        ...base,
        { ...ml.lost1, Icon: TrendingDown, color: '#4ade80', category: 'weight' as const, ...earned(-totalChange >= 1) },
        { ...ml.lost3, Icon: Flame,        color: '#fb923c', category: 'weight' as const, ...earned(-totalChange >= 3) },
        { ...ml.lost5, Icon: Gem,          color: '#c084fc', category: 'weight' as const, ...earned(-totalChange >= 5) },
      ]
    }
    if (isGain) {
      return [
        ...base,
        { ...ml.gained1, Icon: Dumbbell, color: '#4ade80', category: 'weight' as const, ...earned(totalChange >= 1) },
        { ...ml.gained3, Icon: Star,     color: '#fb923c', category: 'weight' as const, ...earned(totalChange >= 3) },
      ]
    }
    return base
  }, [sortedEntries, totalChange, goalPct, goalWeight, isLose, isGain, tp.milestoneList])

  const filteredMilestones = categoryFilter === 'all'
    ? milestones
    : milestones.filter((m) => m.category === categoryFilter)

  const earnedCount = milestones.filter((m) => m.earned).length

  function handleLog() {
    const w = parseFloat(inputWeight)
    if (isNaN(w) || w <= 0) return
    logWeight(w, inputNote.trim() || undefined)
    setInputWeight('')
    setInputNote('')
    setShowModal(false)
  }

  function handleSetGoal() {
    const g = parseFloat(goalInput)
    if (!isNaN(g) && g > 0) {
      setGoalWeight(g)
      setGoalInput('')
      setEditingGoal(false)
    }
  }

  const yDomain = useMemo(() => {
    const weights = chartData.map((d) => d.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const pad = Math.max(1, (max - min) * 0.3)
    return [Math.floor(min - pad), Math.ceil(max + pad)] as [number, number]
  }, [chartData])

  return (
    <PageWrapper className="text-white">
      <div className="pt-20 px-4 md:px-10 lg:px-20 max-w-5xl mx-auto pb-32 md:pb-16 space-y-10">

        {/* Hero */}
        <section className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7 space-y-4">
            <p className="text-[#4ade80] font-bold tracking-widest uppercase text-xs">{tp.currentWeight}</p>
            <div className="flex items-end gap-3">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
                {currentWeight.toFixed(1)}
              </h1>
              <span className="text-3xl text-[#4ade80] font-black mb-2">kg</span>
            </div>
            {weeklyChange !== null && (
              <div className={`flex items-center gap-2 text-sm font-bold ${weeklyChange < 0 ? 'text-[#4ade80]' : weeklyChange > 0 ? 'text-red-400' : 'text-[#a0af9e]'}`}>
                {weeklyChange < 0 ? <TrendingDown size={16} /> : weeklyChange > 0 ? <TrendingUp size={16} /> : <Minus size={16} />}
                {weeklyChange > 0 ? '+' : ''}{weeklyChange.toFixed(1)}kg this week
              </div>
            )}
          </div>

          {/* Goal progress card */}
          <div className="md:col-span-5 bg-[#0d1d10] rounded-3xl p-6 border border-[#172a1a] space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#a0af9e]">
                {tp.target}: {goalWeight ? `${goalWeight}kg` : '—'}
              </span>
              {goalWeight && (
                <span className="text-[#4ade80] font-black">{goalPct}%</span>
              )}
            </div>
            <div className="w-full bg-[#172a1a] h-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${goalPct}%`,
                  background: 'linear-gradient(90deg, #4ade80, #19be64)',
                  boxShadow: '0 0 12px rgba(74,222,128,0.4)',
                }}
              />
            </div>
            {goalWeight ? (
              <p className="text-xs text-[#a0af9e]">
                {goalPct >= 100 ? tp.goalReached : tp.toGoal(currentWeight - goalWeight)}
              </p>
            ) : editingGoal ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder={tp.setGoal}
                  className="flex-1 bg-[#172a1a] text-white text-sm rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#4ade80]"
                  onKeyDown={(e) => e.key === 'Enter' && handleSetGoal()}
                />
                <button onClick={handleSetGoal} className="bg-[#4ade80] text-[#051107] font-black text-xs px-3 py-2 rounded-xl">
                  {tp.save}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingGoal(true)}
                className="text-[#4ade80] text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <Target size={12} /> {tp.setGoal}
              </button>
            )}
          </div>
        </section>

        {/* Chart */}
        <section className="bg-[#0d1d10] rounded-[2rem] p-6 md:p-8 border border-[#172a1a]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl text-white">{tp.trendOverview}</h3>
            <div className="flex bg-[#08160b] p-1 rounded-xl gap-1">
              {(['7d', '30d', 'all'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${
                    filter === f
                      ? 'bg-[#172a1a] text-[#4ade80]'
                      : 'text-[#a0af9e] hover:text-white'
                  }`}
                >
                  {tp.filters[f]}
                </button>
              ))}
            </div>
          </div>

          {chartData.length < 2 ? (
            <div className="h-48 flex items-center justify-center text-[#a0af9e] text-sm">
              {tp.noHistory}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#172a1a" vertical={false} />
                <XAxis dataKey="date" stroke="#a0af9e" tick={{ fontSize: 10, fill: '#a0af9e' }} axisLine={false} tickLine={false} />
                <YAxis domain={yDomain} stroke="#a0af9e" tick={{ fontSize: 10, fill: '#a0af9e' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}kg`} />
                <Tooltip
                  contentStyle={{ background: '#0d1d10', border: '1px solid #172a1a', borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: '#a0af9e' }}
                  formatter={(v) => [`${v} kg`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#4ade80"
                  strokeWidth={3}
                  fill="url(#wGrad)"
                  dot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4ade80', strokeWidth: 2, stroke: '#051107' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Achievements */}
        <section className="space-y-6">

          {/* Hero counter */}
          <div className="relative overflow-hidden bg-[#0d1d10] rounded-[2rem] p-8 border border-[#172a1a]">
            <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#4ade80]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="font-black text-3xl text-white">{tp.milestones}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex -space-x-2">
                    {milestones.filter((m) => m.earned).slice(0, 3).map((m) => (
                      <div key={m.label} className="w-9 h-9 rounded-full border-2 border-[#0d1d10] flex items-center justify-center"
                        style={{ background: `${m.color}20` }}>
                        <m.Icon size={14} style={{ color: m.color }} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[#a0af9e] text-sm">
                    <span className="text-[#4ade80] font-black text-xl">{earnedCount}</span>
                    {' / '}{milestones.length} {tp.badgesEarned(0, 0).split('0 / 0 ')[1]}
                  </p>
                </div>
              </div>
              {/* Category filter */}
              <div className="flex gap-2 flex-wrap">
                {(['all', 'consistency', 'weight'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                      categoryFilter === cat
                        ? 'bg-[#4ade80] text-[#051107]'
                        : 'bg-[#172a1a] text-[#a0af9e] hover:text-white'
                    }`}
                  >
                    {tp.categories[cat]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Achievement grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMilestones.map((m) => (
              <div
                key={m.label}
                className={`rounded-[1.5rem] p-6 flex flex-col items-center text-center border transition-all duration-300 hover:scale-[1.02] ${
                  m.earned
                    ? 'bg-[#0d1d10] border-[#4ade80]/15'
                    : 'bg-[#08160b]/60 border-[#0d1d10] grayscale opacity-60'
                }`}
              >
                {/* Icon circle */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: m.earned ? `${m.color}15` : '#172a1a',
                    filter: m.earned ? `drop-shadow(0 0 10px ${m.color}40)` : 'none',
                  }}
                >
                  {m.earned
                    ? <m.Icon size={28} style={{ color: m.color }} />
                    : <Lock size={20} className="text-[#3d4b3e]" />
                  }
                </div>

                {/* Status badge */}
                <span
                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                  style={m.earned
                    ? { background: `${m.color}20`, color: m.color }
                    : { background: '#172a1a', color: '#3d4b3e' }
                  }
                >
                  {m.earned ? tp.mastered : tp.locked}
                </span>

                <h3 className="text-sm font-black text-white leading-tight mb-1">{m.label}</h3>
                <p className="text-[11px] text-[#a0af9e] leading-relaxed flex-1">{m.desc}</p>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-[#172a1a] w-full">
                  {m.earned && m.earnedAt ? (
                    <p className="text-[10px] text-[#a0af9e] uppercase tracking-tight">
                      {tp.earned} {new Date(m.earnedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  ) : m.earned ? (
                    <p className="text-[10px] uppercase tracking-tight" style={{ color: m.color }}>✓ {tp.mastered}</p>
                  ) : (
                    <p className="text-[10px] text-[#3d4b3e] uppercase tracking-tight">{tp.inProgress}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        <section className="space-y-4">
            <h3 className="font-black text-xl px-1">{tp.history}</h3>
            {sortedEntries.length === 0 ? (
              <div className="bg-[#0d1d10] rounded-2xl p-8 text-center text-[#a0af9e] text-sm border border-dashed border-[#172a1a]">
                {tp.noHistory}
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {[...sortedEntries].reverse().map((entry, i, arr) => {
                  const prev = arr[i + 1]
                  const change = prev ? entry.weight - prev.weight : entry.weight - startWeight
                  return (
                    <div key={entry.id} className="bg-[#08160b] hover:bg-[#0d1d10] rounded-2xl p-4 flex items-center justify-between transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-[#172a1a] flex items-center justify-center text-[#a0af9e]">
                          <span className="text-xs font-black">{sortedEntries.length - i}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{formatHistoryDate(entry.loggedAt, language)}</p>
                          {entry.note && <p className="text-[#a0af9e] text-xs mt-0.5">{entry.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-black text-white">{entry.weight.toFixed(1)} kg</p>
                          <p className={`text-[10px] font-bold uppercase ${change < 0 ? 'text-[#4ade80]' : change > 0 ? 'text-red-400' : 'text-[#a0af9e]'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}kg
                          </p>
                        </div>
                        <button
                          onClick={() => deleteWeight(entry.id)}
                          className="text-[#a0af9e] hover:text-red-400 transition-colors p-1"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
        </section>
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-[#051107] shadow-[0_8px_30px_rgba(74,222,128,0.4)] active:scale-95 transition-transform z-40"
        style={{ background: 'linear-gradient(135deg, #4ade80, #19be64)' }}
      >
        <Plus size={28} strokeWidth={3} />
      </button>

      {/* Log Weight Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 md:pb-0"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="w-full max-w-md bg-[#0d1d10] rounded-3xl p-6 border border-[#172a1a] space-y-5">
            <h3 className="text-xl font-black text-white">{tp.logWeight}</h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0af9e] uppercase tracking-widest">{tp.weightLabel}</label>
              <input
                type="number"
                step="0.1"
                value={inputWeight}
                onChange={(e) => setInputWeight(e.target.value)}
                placeholder={tp.weightPlaceholder}
                autoFocus
                className="w-full bg-[#172a1a] text-white rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-[#4ade80]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#a0af9e] uppercase tracking-widest">{tp.noteLabel}</label>
              <input
                type="text"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                placeholder={tp.notePlaceholder}
                className="w-full bg-[#172a1a] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4ade80]"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl bg-[#172a1a] text-[#a0af9e] font-bold text-sm"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleLog}
                disabled={!inputWeight}
                className="flex-1 py-3 rounded-xl font-black text-sm text-[#051107] disabled:opacity-40 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #4ade80, #19be64)' }}
              >
                {tp.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
