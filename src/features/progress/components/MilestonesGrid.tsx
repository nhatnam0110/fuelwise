import { Lock } from 'lucide-react'
import type { ComponentType } from 'react'
import { useT } from '@/hooks/useT'

export type Milestone = {
  label: string
  desc: string
  Icon: ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>
  color: string
  category: 'consistency' | 'weight'
  earned: boolean
  earnedAt?: number
}

type MilestonesGridProps = {
  milestones: Milestone[]
  categoryFilter: 'all' | 'consistency' | 'weight'
  onCategoryChange: (cat: 'all' | 'consistency' | 'weight') => void
  earnedCount: number
  language: 'en' | 'vi'
  tp: ReturnType<typeof useT>['progress']
}

export function MilestonesGrid({ milestones, categoryFilter, onCategoryChange, earnedCount, language, tp }: MilestonesGridProps) {
  const filtered = categoryFilter === 'all' ? milestones : milestones.filter((m) => m.category === categoryFilter)

  return (
    <section className="space-y-6">
      {/* Header + category filter */}
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
          <div className="flex gap-2 flex-wrap">
            {(['all', 'consistency', 'weight'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
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
        {filtered.map((m) => (
          <div
            key={m.label}
            className={`rounded-[1.5rem] p-6 flex flex-col items-center text-center border transition-all duration-300 hover:scale-[1.02] ${
              m.earned ? 'bg-[#0d1d10] border-[#4ade80]/15' : 'bg-[#08160b]/60 border-[#0d1d10] grayscale opacity-60'
            }`}
          >
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
  )
}
