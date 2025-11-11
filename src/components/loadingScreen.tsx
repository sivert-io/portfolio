import { motion } from 'motion/react'
import { Signature } from './signature'

export function LoadingScreen() {
  return (
    <motion.div
      key="loading-screen"
      className="bg-background fixed inset-0 z-500 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Signature className="h-auto w-24" drawDelay={0} />
    </motion.div>
  )
}
