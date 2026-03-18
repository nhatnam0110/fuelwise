import { motion, type Variants } from 'framer-motion'

const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.25 } },
}

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen bg-white text-[#0d1a0f] pb-20 md:pb-0 px-4 md:px-8 lg:px-12 py-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
