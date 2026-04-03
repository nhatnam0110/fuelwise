import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { useStore } from '@/state'
import { useT } from '@/hooks/useT'
import { calculateMacroTargets } from '@/lib/tdee'
import { Stepper } from '@/features/user/components/Stepper'
import type { UserProfile } from '@/types/user'

type SettingsForm = Omit<UserProfile, 'onboardingComplete'>

const GOAL_EMOJIS = { lose: '🔥', gain: '💪', maintain: '⚖️' }
const ACTIVITY_EMOJIS = { sedentary: '🪑', light: '🚶', moderate: '🏃', active: '🏋️' }

export default function Settings() {
  const navigate = useNavigate()
  const { profile, setProfile, setMacroTargets } = useStore()
  const t = useT()
  const ts = t.settings
  const tc = t.common

  const [form, setForm] = useState<SettingsForm>({
    name:          profile?.name          ?? '',
    age:           profile?.age           ?? 25,
    weight:        profile?.weight        ?? 70,
    height:        profile?.height        ?? 170,
    gender:        profile?.gender        ?? 'male',
    activityLevel: profile?.activityLevel ?? 'moderate',
    goal:          profile?.goal          ?? 'maintain',
  })
  const [saved, setSaved] = useState(false)

  const update = (partial: Partial<SettingsForm>) => setForm((f) => ({ ...f, ...partial }))
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

        <header>
          <h1 className="font-black text-4xl md:text-5xl uppercase tracking-tighter">{ts.title}</h1>
          <p className="text-[#a0af9e] text-sm mt-2">{ts.subtitle}</p>
        </header>

        {/* Personal info */}
        <section className="space-y-4">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">{ts.personalInfo}</h2>
          <input
            type="text"
            value={form.name}
            placeholder={ts.namePlaceholder}
            onChange={(e) => update({ name: e.target.value })}
            className="w-full bg-[#0d1d10] border border-[#1a3a1f] text-white text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-[#4ade80] placeholder:text-[#2d5a35] transition-colors"
          />
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
                {ts.gender[g]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Stepper label="Age"    value={form.age}    unit="yrs" min={10}  max={100} onChange={(v) => update({ age: v })} />
            <Stepper label="Weight" value={form.weight} unit="kg"  min={30}  max={250} onChange={(v) => update({ weight: v })} />
            <Stepper label="Height" value={form.height} unit="cm"  min={100} max={250} onChange={(v) => update({ height: v })} />
          </div>
        </section>

        {/* Goal */}
        <section className="space-y-3">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">{ts.goalSection}</h2>
          {(Object.keys(ts.goals) as Array<keyof typeof ts.goals>).map((key) => (
            <button
              key={key}
              onClick={() => update({ goal: key })}
              className={`w-full text-left rounded-xl p-4 transition-all ${
                form.goal === key
                  ? 'border-2 border-[#4ade80] bg-[#0d3a18]'
                  : 'border border-[#1a3a1f] bg-[#0d1d10] hover:border-[#2d5a35]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{GOAL_EMOJIS[key]}</span>
                <div>
                  <p className="font-black text-white uppercase tracking-wide text-sm">{ts.goals[key].label}</p>
                  <p className="text-xs text-[#4ade80] mt-0.5">{ts.goals[key].desc}</p>
                </div>
                {form.goal === key && <div className="ml-auto w-3 h-3 rounded-full bg-[#4ade80]" />}
              </div>
            </button>
          ))}
        </section>

        {/* Activity level */}
        <section className="space-y-3">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">{ts.activitySection}</h2>
          {(Object.keys(ts.activity) as Array<keyof typeof ts.activity>).map((key) => (
            <button
              key={key}
              onClick={() => update({ activityLevel: key })}
              className={`w-full text-left rounded-xl p-4 transition-all ${
                form.activityLevel === key
                  ? 'border-2 border-[#4ade80] bg-[#0d3a18]'
                  : 'border border-[#1a3a1f] bg-[#0d1d10] hover:border-[#2d5a35]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{ACTIVITY_EMOJIS[key]}</span>
                <div>
                  <p className="font-black text-white uppercase tracking-wide text-sm">{ts.activity[key].label}</p>
                  <p className="text-xs text-[#4ade80] mt-0.5">{ts.activity[key].desc}</p>
                </div>
                {form.activityLevel === key && <div className="ml-auto w-3 h-3 rounded-full bg-[#4ade80]" />}
              </div>
            </button>
          ))}
        </section>

        {/* Live macro preview */}
        <section className="space-y-3">
          <h2 className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold">{ts.targetsSection}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: tc.calories, value: preview.calories, unit: 'kcal', color: '#4ade80' },
              { label: tc.protein,  value: preview.protein,  unit: 'g',    color: '#699cff' },
              { label: tc.carbs,    value: preview.carbs,    unit: 'g',    color: '#facc15' },
              { label: tc.fat,      value: preview.fat,      unit: 'g',    color: '#c084fc' },
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

        <button
          onClick={handleSave}
          disabled={!isValid || saved}
          className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            saved
              ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40'
              : 'bg-gradient-to-br from-[#4ade80] to-[#19be64] text-[#051107] hover:scale-[1.01] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed'
          }`}
        >
          {saved ? <><Check size={18} /> {ts.saved}</> : ts.save}
        </button>
      </div>
    </PageWrapper>
  )
}
