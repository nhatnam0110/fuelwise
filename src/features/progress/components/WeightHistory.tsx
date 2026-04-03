import { Trash2 } from 'lucide-react'
import { useT } from '@/hooks/useT'
import type { WeightEntry } from '@/types/weight'

type WeightHistoryProps = {
  entries: WeightEntry[]
  startWeight: number
  language: 'en' | 'vi'
  tp: ReturnType<typeof useT>['progress']
  onDelete: (id: string) => void
}

function formatDate(ts: number, language: 'en' | 'vi') {
  return new Date(ts).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

export function WeightHistory({ entries, startWeight, language, tp, onDelete }: WeightHistoryProps) {
  const sorted = [...entries].sort((a, b) => a.loggedAt - b.loggedAt)
  const reversed = [...sorted].reverse()

  return (
    <section className="space-y-4">
      <h3 className="font-black text-xl px-1">{tp.history}</h3>
      {sorted.length === 0 ? (
        <div className="bg-[#0d1d10] rounded-2xl p-8 text-center text-[#a0af9e] text-sm border border-dashed border-[#172a1a]">
          {tp.noHistory}
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {reversed.map((entry, i, arr) => {
            const prev = arr[i + 1]
            const change = prev ? entry.weight - prev.weight : entry.weight - startWeight
            return (
              <div key={entry.id} className="bg-[#08160b] hover:bg-[#0d1d10] rounded-2xl p-4 flex items-center justify-between transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-[#172a1a] flex items-center justify-center text-[#a0af9e]">
                    <span className="text-xs font-black">{sorted.length - i}</span>
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{formatDate(entry.loggedAt, language)}</p>
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
                  <button onClick={() => onDelete(entry.id)} className="text-[#a0af9e] hover:text-red-400 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
