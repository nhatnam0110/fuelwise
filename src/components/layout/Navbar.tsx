import { NavLink, useNavigate } from 'react-router-dom'
import { Bell, Settings } from 'lucide-react'
import { useStore } from '@/store'

export function Navbar() {
  const { profile } = useStore()
  const navigate = useNavigate()

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'FW'

  return (
    <nav className="hidden md:flex fixed top-0 w-full bg-[#051107]/90 backdrop-blur-xl text-white px-8 h-16 items-center justify-between z-50 border-b border-[#0d2a12]">
      {/* Logo */}
      <span className="text-2xl font-black tracking-tighter">
        Fuel<span className="text-[#4ade80]">Wise</span>
      </span>

      {/* Nav links */}
      <div className="flex items-center gap-8">
        {[
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/generate',  label: 'Generate'  },
          { to: '/saved',     label: 'Saved'      },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive
                ? 'text-[#4ade80] font-bold text-sm border-b-2 border-[#4ade80] pb-0.5'
                : 'text-[#a0af9e] hover:text-white text-sm font-bold transition-colors'
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="text-[#4ade80] hover:bg-[#0d2a12] rounded-lg p-2 transition-all">
          <Bell size={20} />
        </button>
        <button
          onClick={() => navigate('/saved')}
          className="text-[#4ade80] hover:bg-[#0d2a12] rounded-lg p-2 transition-all"
        >
          <Settings size={20} />
        </button>
        <div className="w-9 h-9 rounded-full border-2 border-[#4ade80] bg-[#0d2a12] flex items-center justify-center text-xs font-black text-[#4ade80]">
          {initials}
        </div>
      </div>
    </nav>
  )
}
