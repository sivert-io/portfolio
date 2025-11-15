import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Signature } from './signature'

const FADE_DELAY_MS = 500
const FADE_DURATION = 1
const FINAL_OPACITY = 0.25
const FINAL_BLUR = 14

export function LoadingScreen() {
  const [hasDrawn, setHasDrawn] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    if (!hasDrawn) {
      return
    }

    const fadeTimeout = window.setTimeout(() => {
      setIsBlurred(true)
    }, FADE_DELAY_MS)

    const statusTimeout = window.setTimeout(
      () => {
        setShowStatus(true)
      },
      FADE_DELAY_MS + FADE_DURATION * 1000
    )

    return () => {
      window.clearTimeout(fadeTimeout)
      window.clearTimeout(statusTimeout)
    }
  }, [hasDrawn])

  const handleDrawComplete = useCallback(() => {
    setHasDrawn(true)
  }, [])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white">
      <motion.div
        initial={{ opacity: 1, filter: 'blur(0px)' }}
        animate={
          isBlurred
            ? { opacity: FINAL_OPACITY, filter: `blur(${FINAL_BLUR}px)` }
            : { opacity: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
        className="pointer-events-none"
      >
        <Signature
          className="h-auto w-[min(600px,85vw)]"
          drawDelay={0}
          enableDraw
          onComplete={handleDrawComplete}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={showStatus ? { opacity: 0.85, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: showStatus ? 0 : 0.4 }}
        className="mt-10 text-xs tracking-[0.6em] text-white/80 uppercase"
      >
        blurred and faded
      </motion.p>
    </div>
  )
}
