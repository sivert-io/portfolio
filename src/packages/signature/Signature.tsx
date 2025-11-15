import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useId, useMemo, useRef } from 'react'
import { SEGMENTS, VIEW_BOX } from './signatureSegments'
import type { AnimatedSegmentProps, SegmentConfig, SignatureProps } from './types'

function AnimatedSegment({
  d,
  delay,
  duration,
  pulseStrokeWidth,
  showPulse,
  pulseFadePortion,
  strokeWidth,
  glowColor,
  glowShadow,
  pulseColor,
  pulseDuration,
  pulseDelayAfterDraw,
  pulseLengthRatio,
  motionEase,
  glowSize, // Added glowSize parameter
}: AnimatedSegmentProps & { glowSize?: number }) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const pathLengthValue = useMotionValue(0)
  const pathOpacityValue = useMotionValue(0)
  const glowOpacityValue = useMotionValue(0)
  const glowXValue = useMotionValue(0)
  const glowYValue = useMotionValue(0)
  const totalLengthValue = useMotionValue(0)
  const pulseOffsetProgressValue = useMotionValue(0)
  const pulseOpacityValue = useMotionValue(0)
  const pulseDasharrayValue = useMotionValue('0 1')
  const pulseDashoffsetValue = useTransform(pulseOffsetProgressValue, (progress) => {
    const total = totalLengthValue.get()
    return total * (1 - progress)
  })

  useEffect(() => {
    const pathElement = pathRef.current
    if (!pathElement) return

    const totalLength = pathElement.getTotalLength()
    const startPoint = pathElement.getPointAtLength(0)
    glowXValue.set(startPoint.x)
    glowYValue.set(startPoint.y)
    totalLengthValue.set(totalLength)

    let pulseAnimationControl: ReturnType<typeof animate> | null = null
    let pulseOpacityControl: ReturnType<typeof animate> | null = null
    let pulseStartTimeout: ReturnType<typeof setTimeout> | null = null

    const configurePulse = () => {
      if (showPulse) {
        const pulseLength = Math.max(totalLength * pulseLengthRatio, strokeWidth * 1.5)
        const pulseGap = Math.max(totalLength - pulseLength, 1)
        pulseDasharrayValue.set(`${pulseLength} ${pulseGap}`)
      } else {
        pulseOpacityValue.set(0)
        pulseDasharrayValue.set('0 1')
      }
    }

    const startPulse = () => {
      if (!showPulse) return
      pulseOffsetProgressValue.set(0)
      const clampedFadePortion = Math.min(Math.max(pulseFadePortion, 0.05), 0.95)
      pulseOpacityControl = animate(pulseOpacityValue, [0, 1, 0], {
        duration: pulseDuration,
        ease: 'linear',
        times: [0, clampedFadePortion, 1],
        repeat: Infinity,
        repeatDelay: 0,
        repeatType: 'loop',
      })
      pulseAnimationControl = animate(pulseOffsetProgressValue, [0, 1], {
        duration: pulseDuration,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: 0,
        repeatType: 'loop',
      })
    }

    configurePulse()

    const pathOpacityControl = animate(pathOpacityValue, 1, {
      delay,
      duration: 0,
    })

    const glowInDuration = Math.min(0.25, duration)
    const glowOutDuration = Math.min(0.25, duration)

    const glowInControl = animate(glowOpacityValue, 1, {
      delay,
      duration: glowInDuration,
      ease: 'easeOut',
    })

    const progressAnimation = animate(pathLengthValue, 1, {
      delay,
      duration,
      ease: motionEase,
      onUpdate: (value) => {
        const point = pathElement.getPointAtLength(value * totalLength)
        glowXValue.set(point.x)
        glowYValue.set(point.y)
      },
    })

    progressAnimation.finished.then(() => {
      animate(glowOpacityValue, 0, {
        duration: glowOutDuration,
        ease: 'easeIn',
        onComplete: () => {
          pathOpacityValue.set(1)
          glowOpacityValue.set(0)
          if (showPulse) {
            pulseStartTimeout = setTimeout(() => {
              startPulse()
            }, pulseDelayAfterDraw * 1000)
          }
        },
      })
    })

    return () => {
      progressAnimation.stop()
      pathOpacityControl.stop()
      glowInControl.stop()
      if (pulseStartTimeout) {
        clearTimeout(pulseStartTimeout)
      }
      pulseAnimationControl?.stop()
      pulseOpacityControl?.stop()
    }
  }, [
    d,
    delay,
    duration,
    glowOpacityValue,
    glowXValue,
    glowYValue,
    pathLengthValue,
    pathOpacityValue,
    pulseDasharrayValue,
    pulseOffsetProgressValue,
    pulseOpacityValue,
    pulseFadePortion,
    pulseDelayAfterDraw,
    pulseDuration,
    pulseLengthRatio,
    strokeWidth,
    glowColor,
    glowShadow,
    pulseColor,
    motionEase,
    showPulse,
    totalLengthValue,
    glowSize, // Add to deps so it is considered
  ])

  return (
    <>
      <motion.path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="#E5E5E5"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength: pathLengthValue, opacity: pathOpacityValue }}
      />
      <motion.circle
        r={typeof glowSize === 'number' ? glowSize : strokeWidth * 2}
        fill={glowColor}
        style={{
          translateX: glowXValue,
          translateY: glowYValue,
          opacity: glowOpacityValue,
          filter: glowShadow,
        }}
      />
      {showPulse ? (
        <motion.path
          d={d}
          fill="none"
          stroke={pulseColor}
          strokeWidth={pulseStrokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: 1,
            strokeDasharray: pulseDasharrayValue,
            strokeDashoffset: pulseDashoffsetValue,
            opacity: pulseOpacityValue,
          }}
        />
      ) : null}
    </>
  )
}

export function Signature({
  className,
  title = 'Signature logo',
  onComplete,
  drawDelay,
  segmentDurations,
  segmentDelays,
  motionEase,
  strokeWidth,
  glowColor,
  glowShadow,
  pulseColor,
  pulseFadePortion,
  pulseDuration,
  pulseDelayAfterDraw,
  pulseLengthRatio,
  pulseStrokeScale,
  glowSize, // Added glowSize parameter
}: SignatureProps & { glowSize?: number }) {
  const titleId = useId()

  const segments = useMemo<SegmentConfig[]>(() => {
    const delays: [number, number] = [
      segmentDelays?.[0] ?? drawDelay,
      segmentDelays?.[1] ?? drawDelay,
    ]

    return SEGMENTS.map((d, index) => {
      const duration = segmentDurations[index] ?? segmentDurations[segmentDurations.length - 1] ?? 0
      const config: SegmentConfig = {
        d,
        delay: delays[index] ?? delays[delays.length - 1] ?? drawDelay,
        duration,
        showPulse: index === 0,
      }
      return config
    })
  }, [drawDelay, segmentDelays, segmentDurations])
  const totalDrawDuration = useMemo(() => {
    const delays: [number, number] = [
      segmentDelays?.[0] ?? drawDelay,
      segmentDelays?.[1] ?? drawDelay,
    ]

    return Math.max(
      ...SEGMENTS.map((_, index) => {
        const duration =
          segmentDurations[index] ?? segmentDurations[segmentDurations.length - 1] ?? 0
        const delay = delays[index] ?? delays[delays.length - 1] ?? drawDelay
        return delay + duration
      })
    )
  }, [drawDelay, segmentDelays, segmentDurations])

  useEffect(() => {
    if (!onComplete) {
      return
    }

    const timeout = window.setTimeout(() => {
      onComplete()
    }, totalDrawDuration * 1000)

    return () => {
      clearTimeout(timeout)
    }
  }, [onComplete, totalDrawDuration])

  return (
    <motion.svg
      className={className}
      viewBox={VIEW_BOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: drawDelay, duration: 0.3 }}
      style={{ overflow: 'visible' }}
    >
      <title id={titleId}>{title}</title>

      {segments.map(({ d, delay, duration, showPulse }) => (
        <AnimatedSegment
          key={`${d}-${delay}-${duration}`}
          d={d}
          delay={delay}
          duration={duration}
          pulseStrokeWidth={strokeWidth * pulseStrokeScale}
          showPulse={showPulse}
          pulseFadePortion={pulseFadePortion}
          strokeWidth={strokeWidth}
          glowColor={glowColor}
          glowShadow={glowShadow}
          pulseColor={pulseColor}
          pulseDuration={pulseDuration}
          pulseDelayAfterDraw={pulseDelayAfterDraw}
          pulseLengthRatio={pulseLengthRatio}
          motionEase={motionEase}
          glowSize={glowSize} // Pass glowSize to AnimatedSegment
        />
      ))}
    </motion.svg>
  )
}
