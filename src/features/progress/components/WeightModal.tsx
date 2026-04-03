import { useState } from 'react'

type WeightModalProps = {
  onClose: () => void
  onLog: (weight: number, note?: string) => void
  labels: {
    title: string
    weightLabel: string
    weightPlaceholder: string
    noteLabel: string
    notePlaceholder: string
    save: string
    cancel: string
  }
}

export function WeightModal({ onClose, onLog, labels }: WeightModalProps) {
  const [inputWeight, setInputWeight] = useState('')
  const [inputNote, setInputNote] = useState('')

  function handleLog() {
    const w = parseFloat(inputWeight)
    if (isNaN(w) || w <= 0) return
    onLog(w, inputNote.trim() || undefined)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 md:pb-0"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-[#0d1d10] rounded-3xl p-6 border border-[#172a1a] space-y-5">
        <h3 className="text-xl font-black text-white">{labels.title}</h3>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#a0af9e] uppercase tracking-widest">{labels.weightLabel}</label>
          <input
            type="number"
            step="0.1"
            value={inputWeight}
            onChange={(e) => setInputWeight(e.target.value)}
            placeholder={labels.weightPlaceholder}
            autoFocus
            className="w-full bg-[#172a1a] text-white rounded-xl px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-[#4ade80]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-[#a0af9e] uppercase tracking-widest">{labels.noteLabel}</label>
          <input
            type="text"
            value={inputNote}
            onChange={(e) => setInputNote(e.target.value)}
            placeholder={labels.notePlaceholder}
            className="w-full bg-[#172a1a] text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#4ade80]"
          />
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#172a1a] text-[#a0af9e] font-bold text-sm"
          >
            {labels.cancel}
          </button>
          <button
            onClick={handleLog}
            disabled={!inputWeight}
            className="flex-1 py-3 rounded-xl font-black text-sm text-[#051107] disabled:opacity-40 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #4ade80, #19be64)' }}
          >
            {labels.save}
          </button>
        </div>
      </div>
    </div>
  )
}
