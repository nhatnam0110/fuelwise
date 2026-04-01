import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Minus, Plus } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/store'
import { calculateMacroTargets } from '@/lib/tdee'
import type { UserProfile } from '@/types/user'

type FormData = Omit<UserProfile, 'onboardingComplete'>

function Stepper({
  label, value, unit, min, max, step = 1, onChange,
}: {
  label: string; value: number; unit: string
  min: number; max: number; step?: number
  onChange: (v: number) => void
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
    <div className="bg-[#0d1d10] border border-[#1a3a1f] rounded-xl p-4">
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

const GOALS: { value: FormData['goal']; emoji: string; label: string; desc: string }[] = [
  { value: 'lose',     emoji: '🔥', label: 'Lose Weight', desc: '−500 kcal/day calorie deficit' },
  { value: 'gain',     emoji: '💪', label: 'Gain Muscle', desc: '+300 kcal/day calorie surplus' },
  { value: 'maintain', emoji: '⚖️', label: 'Maintain',    desc: 'Stay at your current weight'   },
]

const ACTIVITY_LEVELS: { value: FormData['activityLevel']; emoji: string; label: string; desc: string }[] = [
  { value: 'sedentary', emoji: '🪑', label: 'Sedentary',      desc: 'Little or no exercise'           },
  { value: 'light',     emoji: '🚶', label: 'Lightly Active', desc: 'Light exercise 1–3 days/week'    },
  { value: 'moderate',  emoji: '🏃', label: 'Moderate',       desc: 'Moderate exercise 3–5 days/week' },
  { value: 'active',    emoji: '🏋️', label: 'Very Active',   desc: 'Hard exercise 6–7 days/week'     },
]

export default function Settings() {
  const navigate = useNavigate()
  const { profile, setProfile, setMacroTargets } = useStore()

  const [form, setForm] = useState<FormData>({
    name:          profile?.name          ?? '',
    age:           profile?.age           ?? 25,
    weight:        profile?.weight        ?? 70,
    height:        profile?.height        ?? 170,
    gender:        profile?.gender        ?? 'male',
    activityLevel: profile?.activityLevel ?? 'moderate',
    goal:          profile?.goal          ?? 'maintain',
  })
  const [saved, setSaved] = useState(false)

  const update = (partial: Partial<FormData>) => setForm((f) => ({ ...f, ...partial }))

  const preview = calculateMacroTargets({ ...form, onboardingComplete: true })

  const handleSave = () => {
    const updated: UserProfile = { ...form, onboardingComplete: true }
    setProfile(updated)
    setMacroTargets(calculateMacroTargets(updated))
    setSaved(true)
    setTimeout(() => { setSaved(false); navigate('/dashboard') }, 1200)
  }

  const isValid = form.name.trim().length > 0

  return (
    <PageWrapper className="text-white min-h-screen pt-24 pb-28 md:pb-12 px-4 md:px-12 lg:px-24">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Header */}
        <header>
          <h1 className="font-black text-4xl md:text-5xl uppercase tracking-tighter">Profile & Goals</h1>
          <p className="text-[#a0af9e] text-sm mt-2">Changes recalculate your daily macro targets.</p>
        </header>

        {/* Personal info */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">Personal Info</h2>

          {/* Name */}
          <input
            type="text"
            value={form.name}
            placeholder="Your name"
            onChange={(e) => update({ name: e.target.value })}
            className="w-full bg-[#0d1d10] border border-[#1a3a1f] text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-[#4ade80] placeholder:text-[#2d5a35] transition-colors"
          />

          {/* Gender */}
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => update({ gender: g })}
                className={`py-3 rounded-xl font-bold uppercase text-sm tracking-widest transition-colors ${
                  form.gender === g
                    ? 'bg-[#4ade80] text-[#0d1a0f]'
                    : 'bg-[#0d1d10] border border-[#1a3a1f] text-[#4ade80] hover:border-[#4ade80]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Steppers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stepper label="Age"    value={form.age}    unit="yrs" min={10} max={100} onChange={(v) => update({ age: v })} />
            <Stepper label="Weight" value={form.weight} unit="kg"  min={30} max={250} onChange={(v) => update({ weight: v })} />
            <Stepper label="Height" value={form.height} unit="cm"  min={100} max={250} onChange={(v) => update({ height: v })} />
          </div>
        </section>

        {/* Goal */}
        <section className="space-y-3">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">Goal</h2>
          {GOALS.map(({ value, emoji, label, desc }) => (
            <button
              key={value}
              onClick={() => update({ goal: value })}
              className={`w-full text-left rounded-xl p-4 transition-all ${
                form.goal === value
                  ? 'border-2 border-[#4ade80] bg-[#0d3a18]'
                  : 'border border-[#1a3a1f] bg-[#0d1d10] hover:border-[#2d5a35]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-black text-white uppercase tracking-wide text-sm">{label}</p>
                  <p className="text-xs text-[#4ade80] mt-0.5">{desc}</p>
                </div>
                {form.goal === value && <div className="ml-auto w-3 h-3 rounded-full bg-[#4ade80]" />}
              </div>
            </button>
          ))}
        </section>

        {/* Activity level */}
        <section className="space-y-3">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">Activity Level</h2>
          {ACTIVITY_LEVELS.map(({ value, emoji, label, desc }) => (
            <button
              key={value}
              onClick={() => update({ activityLevel: value })}
              className={`w-full text-left rounded-xl p-4 transition-all ${
                form.activityLevel === value
                  ? 'border-2 border-[#4ade80] bg-[#0d3a18]'
                  : 'border border-[#1a3a1f] bg-[#0d1d10] hover:border-[#2d5a35]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{emoji}</span>
                <div>
                  <p className="font-black text-white uppercase tracking-wide text-sm">{label}</p>
                  <p className="text-xs text-[#4ade80] mt-0.5">{desc}</p>
                </div>
                {form.activityLevel === value && <div className="ml-auto w-3 h-3 rounded-full bg-[#4ade80]" />}
              </div>
            </button>
          ))}
        </section>

        {/* Live macro preview */}
        <section className="space-y-3">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">New Daily Targets</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Calories', value: preview.calories, unit: 'kcal', color: '#4ade80' },
              { label: 'Protein',  value: preview.protein,  unit: 'g',    color: '#699cff' },
              { label: 'Carbs',    value: preview.carbs,    unit: 'g',    color: '#facc15' },
              { label: 'Fat',      value: preview.fat,      unit: 'g',    color: '#c084fc' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="bg-[#0d1d10] border border-[#1a3a1f] rounded-xl p-4">
                <p className="text-[10px] tracking-[3px] uppercase font-bold mb-2" style={{ color }}>{label}</p>
                <p className="text-2xl font-black text-white leading-none">
                  {value}<span className="text-xs font-normal text-[#a0af9e] ml-1">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!isValid || saved}
          className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40'
              : 'bg-gradient-to-br from-[#4ade80] to-[#19be64] text-[#051107] hover:scale-[1.01] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? <><Check size={18} /> Saved!</> : 'Save Changes'}
        </button>
      </div>
    </PageWrapper>
  )
}
