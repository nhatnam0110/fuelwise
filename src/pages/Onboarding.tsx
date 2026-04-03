import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/state'
import { calculateMacroTargets } from '@/lib/tdee'
import { Stepper } from '@/features/user/components/Stepper'
import type { UserProfile } from '@/types/user'
import onboardingBg from '@/assets/herobg.jpg'

type FormData = Omit<UserProfile, 'onboardingComplete'>

const defaultForm: FormData = {
  name: '',
  age: 25,
  weight: 70,
  height: 170,
  gender: 'male',
  activityLevel: 'moderate',
  goal: 'maintain',
}

// Step progress bar 

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 mb-5 md:mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-[#1a3a1f]">
          <motion.div
            className="h-full bg-[#4ade80] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: i < current ? '100%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  )
}

// Step 1 — Personal Info 

function StepOne({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-4 md:space-y-8">
      <div>
        <p className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold mb-2">Step 1 of 3</p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
          Tell Us<br />about you?
        </h2>
        <p className="text-gray-400 text-base font-medium border-l-2 border-[#4ade80]/30 pl-4 mt-3">Let's build your personal nutrition profile.</p>
      </div>

      {/* Name */}
      <div>
        <label className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold block mb-2">Name</label>
        <input
          type="text"
          value={data.name}
          placeholder="Your name"
          onChange={(e) => onChange({ name: e.target.value })}
          className="bg-[#0d2a12] border border-[#1a3a1f] text-white text-lg rounded-xl px-4 py-2 md:py-3.5 focus:outline-none focus:border-[#4ade80] w-full placeholder:text-[#2d5a35] transition-colors"
        />
      </div>

      {/* Gender toggle */}
      <div>
        <label className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold block mb-2">Gender</label>
        <div className="grid grid-cols-2 gap-2">
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              onClick={() => onChange({ gender: g })}
              className={`py-2 md:py-3 rounded-xl font-bold uppercase text-sm tracking-widest transition-colors ${
                data.gender === g
                  ? 'bg-[#4ade80] text-[#0d1a0f]'
                  : 'bg-[#0d2a12] border border-[#1a3a1f] text-[#4ade80] hover:border-[#4ade80]'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Steppers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Stepper label="Age"    value={data.age}    unit="yrs" min={10} max={100} onChange={(v) => onChange({ age: v })} className="bg-[#0d2a12]" />
        <Stepper label="Weight" value={data.weight} unit="kg"  min={30} max={250} onChange={(v) => onChange({ weight: v })} className="bg-[#0d2a12]" />
        <Stepper label="Height" value={data.height} unit="cm"  min={100} max={250} onChange={(v) => onChange({ height: v })} className="bg-[#0d2a12]" />
      </div>
    </div>
  )
}

// Step 2 — Goal 

const GOALS: { value: FormData['goal']; emoji: string; label: string; desc: string }[] = [
  { value: 'lose',     emoji: '🔥', label: 'Lose Weight',  desc: '−500 kcal/day calorie deficit'   },
  { value: 'gain',     emoji: '💪', label: 'Gain Muscle',  desc: '+300 kcal/day calorie surplus'   },
  { value: 'maintain', emoji: '⚖️', label: 'Maintain',     desc: 'Stay at your current weight'     },
]

function StepTwo({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <p className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold mb-2">Step 2 of 3</p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
          What's<br />the mission?
        </h2>
        <p className="text-gray-400 text-base font-medium border-l-2 border-[#4ade80]/30 pl-4 mt-3">Choose your primary body goal.</p>
      </div>
      <div className="space-y-3">
        {GOALS.map(({ value, emoji, label, desc }) => (
          <button
            key={value}
            onClick={() => onChange({ goal: value })}
            className={`w-full text-left rounded-xl p-3 md:p-5 transition-all duration-200 ${
              data.goal === value
                ? 'border-2 border-[#4ade80] bg-[#0d3a18]'
                : 'border border-[#1a3a1f] bg-[#0d2a12] hover:border-[#2d5a35]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-black text-white uppercase tracking-wide">{label}</p>
                <p className="text-xs text-[#4ade80] mt-0.5">{desc}</p>
              </div>
              {data.goal === value && (
                <div className="ml-auto w-3 h-3 rounded-full bg-[#4ade80]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 3 — Activity 

const ACTIVITY_LEVELS: { value: FormData['activityLevel']; emoji: string; label: string; desc: string }[] = [
  { value: 'sedentary', emoji: '🪑', label: 'Sedentary',      desc: 'Little or no exercise'            },
  { value: 'light',     emoji: '🚶', label: 'Lightly Active', desc: 'Light exercise 1–3 days/week'     },
  { value: 'moderate',  emoji: '🏃', label: 'Moderate',        desc: 'Moderate exercise 3–5 days/week'  },
  { value: 'active',    emoji: '🏋️', label: 'Very Active',    desc: 'Hard exercise 6–7 days/week'      },
]

function StepThree({ data, onChange }: { data: FormData; onChange: (d: Partial<FormData>) => void }) {
  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <p className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold mb-2">Step 3 of 3</p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
          How active<br />are you?
        </h2>
        <p className="text-gray-400 text-base font-medium border-l-2 border-[#4ade80]/30 pl-4 mt-3">This calibrates your daily calorie burn.</p>
      </div>
      <div className="space-y-3">
        {ACTIVITY_LEVELS.map(({ value, emoji, label, desc }) => (
          <button
            key={value}
            onClick={() => onChange({ activityLevel: value })}
            className={`w-full text-left rounded-xl p-3 md:p-5 transition-all duration-200 ${
              data.activityLevel === value
                ? 'border-2 border-[#4ade80] bg-[#0d3a18]'
                : 'border border-[#1a3a1f] bg-[#0d2a12] hover:border-[#2d5a35]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="font-black text-white uppercase tracking-wide">{label}</p>
                <p className="text-xs text-[#4ade80] mt-0.5">{desc}</p>
              </div>
              {data.activityLevel === value && (
                <div className="ml-auto w-3 h-3 rounded-full bg-[#4ade80]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 4 — Confirm targets

function StepConfirm({ data, onConfirm }: { data: FormData; onConfirm: () => void }) {
  const targets = calculateMacroTargets({ ...data, onboardingComplete: true })
  const macros = [
    { label: 'Calories', value: targets.calories, unit: 'kcal', color: '#4ade80' },
    { label: 'Protein',  value: targets.protein,  unit: 'g',    color: '#3b82f6' },
    { label: 'Carbs',    value: targets.carbs,    unit: 'g',    color: '#f59e0b' },
    { label: 'Fat',      value: targets.fat,      unit: 'g',    color: '#a78bfa' },
  ]

  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <p className="text-[10px] tracking-[3px] uppercase text-[#4ade80] font-bold mb-2">Your Fuel Plan</p>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
          Ready,<br />{data.name.split(' ')[0]}.
        </h2>
        <p className="text-gray-400 text-base font-medium border-l-2 border-[#4ade80]/30 pl-4 mt-3">Here are your personalised daily targets.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {macros.map(({ label, value, unit, color }) => (
          <div key={label} className="bg-[#0d2a12] border border-[#1a3a1f] rounded-xl p-4">
            <p className="text-[10px] tracking-[3px] uppercase font-bold mb-2" style={{ color }}>{label}</p>
            <p className="text-3xl font-black text-white leading-none">
              {value}
              <span className="text-sm font-normal text-[#4ade80] ml-1">{unit}</span>
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={onConfirm}
        className="bg-[#4ade80] text-[#0d1a0f] font-black uppercase tracking-widest px-6 py-3 md:py-4 rounded-xl hover:bg-[#86efac] transition-colors w-full text-sm"
      >
        Start Fueling →
      </button>
    </div>
  )
}

// Main page 

const slideVariants: import('framer-motion').Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit:    { opacity: 0, x: -40, transition: { duration: 0.2 } },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { setProfile, setMacroTargets } = useStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(defaultForm)

  const update = (partial: Partial<FormData>) => setForm((f) => ({ ...f, ...partial }))
  const isStep1Valid = form.name.trim().length > 0 && form.age > 0 && form.weight > 0 && form.height > 0

  const handleConfirm = () => {
    const profile: UserProfile = { ...form, onboardingComplete: true }
    setProfile(profile)
    setMacroTargets(calculateMacroTargets(profile))
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4 py-6 md:px-8 md:py-12 relative overflow-x-hidden">
      {/* Background image with dark overlay */}
      <div className="fixed inset-0 z-0">
        <img src={onboardingBg} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#051107]/85" />
      </div>
      <div className="relative z-10 w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-6 md:mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4">
            Fuel<span className="text-[#35AB41]">Wise</span>
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-[#5CD15D]/30 flex-1 min-w-[40px]" />
            <p className="text-[11px] font-black tracking-[0.5em] uppercase text-white/70 whitespace-nowrap">
              Eat with Purpose
            </p>
            <div className="h-px bg-[#5CD15D]/30 flex-1 min-w-[40px]" />
          </div>
        </div>

        {step < 4 && <StepIndicator current={step} total={3} />}

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={slideVariants} initial="initial" animate="animate" exit="exit">
            {step === 1 && <StepOne    data={form} onChange={update} />}
            {step === 2 && <StepTwo    data={form} onChange={update} />}
            {step === 3 && <StepThree  data={form} onChange={update} />}
            {step === 4 && <StepConfirm data={form} onConfirm={handleConfirm} />}
          </motion.div>
        </AnimatePresence>

        {step < 4 && (
          <div className="flex gap-3 mt-4 md:mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="border border-[#1a3a1f] text-[#4ade80] hover:border-[#4ade80] px-5 py-2.5 md:py-3.5 rounded-xl transition-colors text-sm font-bold uppercase tracking-wider"
              >
                Back
              </button>
            )}
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !isStep1Valid}
              className="flex-1 bg-[#4ade80] text-[#0d1a0f] font-black uppercase tracking-widest py-2.5 md:py-3.5 rounded-xl hover:bg-[#86efac] transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'Calculate →' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
