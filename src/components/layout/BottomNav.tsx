import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ChefHat, Heart, TrendingUp, History } from 'lucide-react'
import { useT } from '@/hooks/useT'

export function BottomNav() {
  const t = useT()

  const tabs = [
    { to: '/dashboard',  icon: LayoutDashboard, label: t.nav.dash          },
    { to: '/generate',   icon: ChefHat,         label: t.nav.cook          },
    { to: '/history',    icon: History,          label: t.history.navShort  },
    { to: '/progress',   icon: TrendingUp,      label: t.nav.progress      },
    { to: '/saved',      icon: Heart,           label: t.nav.saved         },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#051107]/95 backdrop-blur-xl border-t border-[#0d2a12] flex items-center justify-around py-3 px-4 rounded-t-3xl shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors ${
              isActive ? 'text-[#4ade80]' : 'text-[#a0af9e]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#4ade80]/10' : ''}`}>
                <Icon size={20} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
