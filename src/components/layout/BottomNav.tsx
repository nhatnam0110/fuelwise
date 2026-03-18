import { NavLink } from 'react-router-dom'
import { Target, LayoutDashboard, ChefHat, Heart } from 'lucide-react'

const tabs = [
  { to: '/onboarding', icon: Target,          label: 'Goal'  },
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dash'  },
  { to: '/generate',   icon: ChefHat,         label: 'Cook'  },
  { to: '/saved',      icon: Heart,           label: 'Saved' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-[#e5e7eb] flex items-center justify-around py-2 px-4">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#16a34a]' : 'text-[#9ca3af]'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
