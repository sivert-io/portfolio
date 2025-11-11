import { motion } from 'motion/react'
import { Signature } from './signature'
import { usePage } from '../hooks'

export function LoadingScreen() {
  const { setIsLoading } = usePage()
  return (
    <motion.div
      key="loading-screen"
      className="bg-background fixed inset-0 z-500 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <Signature className="h-auto w-24 scale-200" />
    </motion.div>
  )
}
