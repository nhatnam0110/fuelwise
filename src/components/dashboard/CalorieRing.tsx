const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function CalorieRing({ consumed, target, label, of: ofLabel, kcal }: {
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
