import type { MotionProps } from 'motion/react'

export const pageMotionProps: MotionProps = {
  initial: { x: '-6%', opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: '6%', opacity: 0 },
  transition: { duration: 0.1, ease: 'easeOut' },
}
