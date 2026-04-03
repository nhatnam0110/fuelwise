import { useState, useRef } from 'react'
import { X, Search, UtensilsCrossed } from 'lucide-react'
import { useT } from '@/hooks/useT'

const RECENT = ['Avocado', 'Greek Yogurt', 'Sweet Potato', 'Kale', 'Chicken Breast', 'Quinoa']

type IngredientInputProps = {
  ingredients: string[]
  onAdd: (val: string) => void
}

export function IngredientInput({ ingredients, onAdd }: IngredientInputProps) {
  const t = useT()
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleAdd(val = value.trim()) {
    if (!val || ingredients.includes(val)) return
    onAdd(val)
    setValue('')
    inputRef.current?.focus()
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <UtensilsCrossed size={18} className="text-[#4ade80]" />
        <h3 className="font-black text-lg text-white">{t.generator.ingredientsTitle}</h3>
      </div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0af9e]" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={t.generator.ingredientPlaceholder}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="w-full bg-[#0d1d10] rounded-xl py-4 pl-11 pr-4 text-white text-sm placeholder:text-[#a0af9e]/50 focus:outline-none focus:ring-2 focus:ring-[#4ade80]/40 transition-all"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] text-[#a0af9e] uppercase tracking-widest w-full mb-1">{t.generator.recentlyUsed}</span>
        {RECENT.map((item) => (
          <button
            key={item}
            onClick={() => handleAdd(item)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#122315] text-[#a0af9e] text-xs hover:bg-[#4ade80]/10 hover:text-[#4ade80] transition-all border border-[#3d4b3e]/10"
          >
            {item} <X size={11} />
          </button>
        ))}
      </div>
    </section>
  )
}
