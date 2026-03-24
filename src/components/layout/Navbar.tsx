import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import { useStore } from '@/store'
import { useT } from '@/hooks/useT'

export function Navbar() {
  const { profile, language, setLanguage } = useStore()
  const navigate = useNavigate()
  const t = useT()

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'FW'

  return (
    <nav className="hidden md:grid grid-cols-3 fixed top-0 w-full bg-[#051107]/90 backdrop-blur-xl text-white px-8 h-16 items-center z-50 border-b border-[#0d2a12]">
      {/* Logo */}
      <span className="text-2xl font-black tracking-tighter">
        Fuel<span className="text-[#4ade80]">Wise</span>
      </span>

      {/* Nav links — pill container */}
      <div className="flex items-center justify-center gap-1 bg-[#0a1a0c] border border-[#172a1a] rounded-full px-1.5 py-1.5 w-fit mx-auto">
        {[
          { to: '/dashboard', label: t.nav.dashboard },
          { to: '/generate',  label: t.nav.generate  },
          { to: '/progress',  label: t.nav.progress  },
          { to: '/saved',     label: t.nav.saved      },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'px-5 py-1.5 rounded-full bg-[#4ade80] text-[#051107] font-black text-sm tracking-wide transition-all'
                : 'px-5 py-1.5 rounded-full bg-[#0d1d10] text-[#a0af9e] hover:text-white font-bold text-sm tracking-wide transition-all'
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 justify-end">
        {/* Language toggle */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'vi' : 'en')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#1a3a1f] text-xs font-black tracking-widest text-[#a0af9e] hover:border-[#4ade80] hover:text-[#4ade80] transition-all"
        >
          <span className={language === 'en' ? 'text-[#4ade80]' : ''}>EN</span>
          <span className="text-[#3d4b3e]">|</span>
          <span className={language === 'vi' ? 'text-[#4ade80]' : ''}>VI</span>
        </button>

        <button
          onClick={() => navigate('/saved')}
          className="text-[#4ade80] hover:bg-[#0d2a12] rounded-lg p-2 transition-all"
          title={t.nav.settings}
        >
          <Settings size={20} />
        </button>
      </div>
    </nav>
  )
}
