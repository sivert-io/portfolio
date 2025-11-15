export type SignatureProps = {
  className?: string
  title?: string
  onComplete?: () => void
  drawDelay: number
  segmentDurations: [number, number]
  segmentDelays?: [number, number]
  motionEase: [number, number, number, number]
  strokeWidth: number
  glowColor: string
  glowShadow: string
  pulseColor: string
  pulseFadePortion: number
  pulseDuration: number
  pulseDelayAfterDraw: number
  pulseLengthRatio: number
  pulseStrokeScale: number
}

export type SegmentConfig = {
  d: string
  delay: number
  duration: number
  showPulse: boolean
}

export type AnimatedSegmentProps = SegmentConfig & {
  pulseStrokeWidth: number
  strokeWidth: number
  glowColor: string
  glowShadow: string
  pulseColor: string
  pulseFadePortion: number
  pulseDuration: number
  pulseDelayAfterDraw: number
  pulseLengthRatio: number
  motionEase: [number, number, number, number]
}


export type AppType = {
  name: string
  description: string
  image: string
}