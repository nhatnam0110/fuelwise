import { useEffect, lazy, Suspense } from 'react'
import herobg from '@/assets/herobg.jpg'
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
import { formatDate } from '@/lib/utils'

const Onboarding = lazy(() => import('@/pages/Onboarding'))
const Dashboard  = lazy(() => import('@/pages/Dashboard'))
const Generator  = lazy(() => import('@/pages/Generator'))
const Result     = lazy(() => import('@/pages/Result'))
const Saved      = lazy(() => import('@/pages/Saved'))
const Progress   = lazy(() => import('@/pages/Progress'))

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

  const content = (
    <>
      {!isOnboarding && <Navbar />}
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </Suspense>
      {!isOnboarding && <BottomNav />}
    </>
  )

  if (isOnboarding) return content

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${herobg})` }}
    >
      <div className="min-h-screen bg-[#051107]/85">
        {content}
      </div>
    </div>
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
