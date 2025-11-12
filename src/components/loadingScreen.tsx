import { AnimatePresence, motion } from 'motion/react'
import { Signature } from './signature'
import { usePage } from '../hooks'
export function LoadingScreen() {
  const { isLoading, hasLoadedOnce } = usePage()
  const shouldShowIntro = isLoading && !hasLoadedOnce

  return (
    <AnimatePresence>
      {shouldShowIntro && (
        <motion.div
          key="initial-loader"
          className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeOut' } }}
        >
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />

          <motion.div
            className="absolute inset-0 z-10 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <Signature className="h-auto w-28" drawDelay={0} enableDraw />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
