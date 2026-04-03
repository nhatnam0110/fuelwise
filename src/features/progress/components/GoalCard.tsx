import { useState } from 'react'
import { Target } from 'lucide-react'
import { useT } from '@/hooks/useT'

type GoalCardProps = {
  goalWeight: number | null
  goalPct: number
  currentWeight: number
  tp: ReturnType<typeof useT>['progress']
  onSetGoal: (weight: number) => void
}

export function GoalCard({ goalWeight, goalPct, currentWeight, tp, onSetGoal }: GoalCardProps) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')

  function handleSave() {
    const g = parseFloat(input)
    if (!isNaN(g) && g > 0) {
      onSetGoal(g)
      setInput('')
      setEditing(false)
    }
  }

  return (
    <div className="md:col-span-5 bg-[#0d1d10] rounded-3xl p-6 border border-[#172a1a] space-y-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-[#a0af9e]">
          {tp.target}: {goalWeight ? `${goalWeight}kg` : '—'}
        </span>
        {goalWeight && <span className="text-[#4ade80] font-black">{goalPct}%</span>}
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
      ) : editing ? (
        <div className="flex gap-2">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tp.setGoal}
            className="flex-1 bg-[#172a1a] text-white text-sm rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-[#4ade80]"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button onClick={handleSave} className="bg-[#4ade80] text-[#051107] font-black text-xs px-3 py-2 rounded-xl">
            {tp.save}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-[#4ade80] text-xs font-bold flex items-center gap-1 hover:underline"
        >
          <Target size={12} /> {tp.setGoal}
        </button>
      )}
    </div>
  )
}
