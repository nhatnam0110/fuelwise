import { useEffect } from 'react'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Dashboard'
import Generator from '@/pages/Generator'
import Result from '@/pages/Result'
import Saved from '@/pages/Saved'
import Progress from '@/pages/Progress'
import { formatDate } from '@/lib/utils'

function AppShell() {
  const location = useLocation()
  const { profile, dailyLog, resetDailyLog } = useStore()
  const isOnboarding = location.pathname === '/onboarding'

  // Guard: redirect to onboarding if not complete
  if (!profile?.onboardingComplete && !isOnboarding) {
    return <Navigate to="/onboarding" replace />
  }

  // Reset daily log if it's a new day
  if (dailyLog && dailyLog.date !== formatDate(new Date())) {
    resetDailyLog()
  }

  return (
    <>
      {!isOnboarding && <Navbar />}
      <AnimatePresence mode="wait">
        <Outlet key={location.pathname} />
      </AnimatePresence>
      {!isOnboarding && <BottomNav />}
    </>
  )
}

// Wrap in component so useEffect can reset log reactively
function AppShellWrapper() {
  const { dailyLog, resetDailyLog } = useStore()

  useEffect(() => {
    if (dailyLog && dailyLog.date !== formatDate(new Date())) {
      resetDailyLog()
    }
  }, [dailyLog, resetDailyLog])

  return <AppShell />
}

const router = createBrowserRouter([
  {
    element: <AppShellWrapper />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/dashboard',  element: <Dashboard /> },
      { path: '/generate',   element: <Generator /> },
      { path: '/recipe/:id', element: <Result /> },
      { path: '/saved',      element: <Saved /> },
      { path: '/progress',   element: <Progress /> },
      { path: '/',           element: <Navigate to="/dashboard" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
