import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

export function Stepper({
  label, value, unit, min, max, step = 1, onChange, className,
}: {
  label: string; value: number; unit: string
  min: number; max: number; step?: number
  onChange: (v: number) => void
  className?: string
}) {
  const [raw, setRaw] = useState(String(value))

  const handleButton = (next: number) => { onChange(next); setRaw(String(next)) }
  const handleBlur = () => {
    const parsed = Number(raw)
    const clamped = isNaN(parsed) ? value : Math.min(max, Math.max(min, parsed))
    onChange(clamped)
    setRaw(String(clamped))
  }

  return (
    <div className={`border border-[#1a3a1f] rounded-xl p-4 ${className ?? 'bg-[#0d1d10]'}`}>
      <div className="flex items-center gap-1.5 mb-3">
        <p className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">{label}</p>
        <span className="text-[10px] tracking-[2px] uppercase text-[#2d5a35] font-bold">· {unit}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => handleButton(Math.max(min, value - step))}
          className="w-9 h-9 rounded-full border border-[#1a3a1f] flex items-center justify-center text-[#4ade80] hover:border-[#4ade80] transition-colors"
        >
          <Minus size={14} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onBlur={handleBlur}
          className="w-16 bg-transparent text-white text-3xl font-black text-center focus:outline-none caret-[#4ade80]"
        />
        <button
          onClick={() => handleButton(Math.min(max, value + step))}
          className="w-9 h-9 rounded-full border border-[#1a3a1f] flex items-center justify-center text-[#4ade80] hover:border-[#4ade80] transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
