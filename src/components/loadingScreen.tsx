import { animate, motion, useMotionValue } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { Signature } from '../packages/signature'

const FADE_DELAY_MS = 500
const FADE_DURATION_S = 0.45
const FINAL_SIGNATURE_OPACITY = 0.2
const FINAL_BLUR_PX = 0
const START_SCALE = 1.25
const END_SCALE = 0.75
const COLOR = '#5D3FD3'

type LoadingScreenProps = {
  setShowStatus: (show: boolean) => void
}

export function LoadingScreen({ setShowStatus }: LoadingScreenProps) {
  const [hasDrawn, setHasDrawn] = useState(false)
  const [isSettled, setIsSettled] = useState(false)

  const signatureOpacity = useMotionValue(1)

  useEffect(() => {
    if (!hasDrawn) return

    let signatureFadeControl: ReturnType<typeof animate> | null = null

    const fadeTimeout = window.setTimeout(() => {
      setIsSettled(true)

      signatureFadeControl = animate(signatureOpacity, FINAL_SIGNATURE_OPACITY, {
        duration: FADE_DURATION_S,
        ease: 'easeOut',
      })
    }, FADE_DELAY_MS)

    const statusTimeout = window.setTimeout(
      () => {
        setShowStatus(true)
      },
      FADE_DELAY_MS + FADE_DURATION_S * 1000
    )

    return () => {
      window.clearTimeout(fadeTimeout)
      window.clearTimeout(statusTimeout)
      signatureFadeControl?.stop()
    }
  }, [hasDrawn, setShowStatus, signatureOpacity])

  const handleDrawComplete = useCallback(() => {
    setHasDrawn(true)
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      <motion.div
        initial={{ filter: 'blur(0px)', scale: START_SCALE }}
        animate={
          isSettled
            ? { filter: `blur(${FINAL_BLUR_PX}px)`, scale: END_SCALE }
            : { filter: 'blur(0px)', scale: START_SCALE }
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
          signatureOpacity={signatureOpacity}
          effectsOpacity={1}
        />
      </motion.div>
    </div>
  )
}
