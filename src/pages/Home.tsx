import { motion } from 'motion/react'
import { pageMotionProps } from './pageMotion'

export function HomePage() {
  return (
    <motion.div {...pageMotionProps}>
      <h1>Home</h1>
      <span className="text-foreground fixed right-8 bottom-8 text-7xl font-black uppercase">
        Portfolio
      </span>
    </motion.div>
  )
}
