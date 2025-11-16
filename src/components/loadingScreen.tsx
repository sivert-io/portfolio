import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Signature } from '../packages/signature'

const FADE_DELAY_MS = 500
const FADE_DURATION = 1
const FINAL_OPACITY = 0.5
const FINAL_BLUR = 14

export function LoadingScreen({ setShowStatus }: { setShowStatus: (show: boolean) => void }) {
  const [hasDrawn, setHasDrawn] = useState(false)
  const [isBlurred, setIsBlurred] = useState(false)

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
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      <motion.div
        initial={{ opacity: 1, filter: 'blur(0px)' }}
        animate={
          isBlurred
            ? { opacity: FINAL_OPACITY, filter: `blur(${FINAL_BLUR}px)` }
            : { opacity: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
        className="pointer-events-none absolute"
      >
        <Signature
          className="h-auto w-[min(600px,85vw)]"
          onComplete={handleDrawComplete}
          drawDelay={0}
          segmentDurations={[1.5, 0.1]}
          segmentDelays={[0, 1.4]}
          motionEase={[0.42, 0, 0.58, 1]}
          strokeWidth={32}
          glowSize={48}
          glowColor="rgba(125, 125, 255, 1)"
          glowShadow="drop-shadow(0 0 22px rgba(253, 224, 71, 0.75))"
          pulseColor="rgba(125, 125, 255, 1)"
          pulseFadePortion={0.3}
          pulseDuration={4}
          pulseDelayAfterDraw={0.25}
          pulseLengthRatio={0.04}
          pulseStrokeScale={3}
        />
      </motion.div>
    </div>
  )
}
