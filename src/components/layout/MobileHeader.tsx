import { useNavigate } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { useStore } from '@/store'

export function MobileHeader() {
  const navigate = useNavigate()
  const { language, setLanguage } = useStore()

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-14 bg-[#051107]/90 backdrop-blur-xl border-b border-[#0d2a12]">
      <span className="text-xl font-black tracking-tighter text-white">
        Fuel<span className="text-[#4ade80]">Wise</span>
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#1a3a1f] text-[10px] font-black tracking-widest text-[#a0af9e]"
        >
          <span className={language === 'en' ? 'text-[#4ade80]' : ''}>EN</span>
          <span className="text-[#3d4b3e]">|</span>
          <span className={language === 'vi' ? 'text-[#4ade80]' : ''}>VI</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className="text-[#a0af9e] hover:text-[#4ade80] transition-colors p-1.5"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  )
}
