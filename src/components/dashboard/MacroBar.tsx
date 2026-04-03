export function MacroBar({ label, consumed, target, color }: {
  label: string; consumed: number; target: number; color: string
}) {
  const pct = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="font-bold text-base text-white">{label}</span>
        <span className="text-sm text-[#a0af9e]">
          <span className="font-bold" style={{ color }}>{consumed}g</span> / {target}g
        </span>
      </div>
      <div className="h-2.5 w-full bg-[#172a1a] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}66` }}
        />
      </div>
    </div>
  )
}
