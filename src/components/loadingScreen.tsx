import { AnimatePresence, motion } from 'motion/react'
import { Signature } from './signature'
import { usePage } from '../hooks'
import { useEffect, useRef } from 'react'

export function LoadingScreen() {
  const { isLoading } = usePage()
  const hasCompletedInitialLoad = useRef(false)

  useEffect(() => {
    if (!isLoading) {
      hasCompletedInitialLoad.current = true
    }
  }, [isLoading])

  const isPageTransition = hasCompletedInitialLoad.current

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key={isPageTransition ? 'transition-overlay' : 'initial-loader'}
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
        >
          <motion.div
            className="absolute inset-0 bg-black"
            initial={isPageTransition ? { x: '-110%' } : { opacity: 1 }}
            animate={isPageTransition ? { x: 0 } : { opacity: 1 }}
            exit={
              isPageTransition
                ? { x: '110%', transition: { duration: 0.5, ease: 'easeInOut' } }
                : { opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }
            }
            transition={
              isPageTransition
                ? { duration: 0.45, ease: 'easeInOut' }
                : { duration: 0.6, ease: 'easeOut' }
            }
          />

          <motion.div
            className="absolute inset-0 z-10 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
              delay: isPageTransition ? 0.05 : 0,
            }}
          >
            <Signature className="h-auto w-28" drawDelay={0} enableDraw={!isPageTransition} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
