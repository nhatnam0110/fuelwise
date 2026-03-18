import { NavLink } from 'react-router-dom'

export function Navbar() {
  return (
    <nav className="hidden md:flex bg-[#0d1a0f] text-white px-8 h-14 items-center justify-between sticky top-0 z-50">
      <span className="font-black uppercase tracking-widest text-sm">
        Fuel<span className="text-[#4ade80]">Wise</span>
      </span>
      <div className="flex items-center gap-6">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? 'text-[#4ade80] font-semibold text-sm'
              : 'text-[#6b7280] hover:text-white text-sm transition-colors'
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/generate"
          className={({ isActive }) =>
            isActive
              ? 'text-[#4ade80] font-semibold text-sm'
              : 'text-[#6b7280] hover:text-white text-sm transition-colors'
          }
        >
          Generate
        </NavLink>
        <NavLink
          to="/saved"
          className={({ isActive }) =>
            isActive
              ? 'text-[#4ade80] font-semibold text-sm'
              : 'text-[#6b7280] hover:text-white text-sm transition-colors'
          }
        >
          Saved
        </NavLink>
      </div>
    </nav>
  )
}
