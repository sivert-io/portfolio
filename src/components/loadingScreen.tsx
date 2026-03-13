import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Signature } from '../packages/signature'

const FADE_DELAY_MS = 500
const FADE_DURATION = 0.45
const FINAL_OPACITY = 0.1
const FINAL_BLUR = 2
const START_SIZE = 1.25
const END_SIZE = 0.75
const COLOR = '#CC2936'

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
  }, [hasDrawn, setShowStatus])

  const handleDrawComplete = useCallback(() => {
    setHasDrawn(true)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      <motion.div
        initial={{ opacity: 1, filter: 'blur(0px)', scale: START_SIZE }}
        animate={
          isBlurred
            ? { opacity: FINAL_OPACITY, filter: `blur(${FINAL_BLUR}px)`, scale: END_SIZE }
            : { opacity: 1, filter: 'blur(0px)', scale: START_SIZE }
        }
        transition={{ type: 'spring', stiffness: 15, damping: 10 }}
        className="pointer-events-none absolute"
      >
        <Signature
          className="h-auto w-[min(350px,85vw)]"
          onComplete={handleDrawComplete}
          drawDelay={0}
          segmentDurations={[1.5, 0.1]}
          segmentDelays={[0, 1.4]}
          motionEase={[0.42, 0, 0.58, 1]}
          strokeWidth={32}
          glowSize={48}
          glowColor={COLOR}
          glowShadow={`drop-shadow(0 0 12px ${COLOR})`}
          pulseColor={COLOR}
          pulseFadePortion={0.25}
          pulseDuration={2.5}
          pulseDelayAfterDraw={0.5}
          pulseLengthRatio={0.04}
          pulseStrokeScale={2}
        />
      </motion.div>
    </div>
  )
}
