import { useRef } from 'react'
import type { MotionValue } from 'motion/react'

function getAngle(cx: number, cy: number, px: number, py: number) {
  return Math.atan2(py - cy, px - cx) * (180 / Math.PI)
}

export function useWheelDrag(
  wheel: MotionValue<number>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  dragging: { current: boolean },
  prevWheelAngle: { current: number },
  wheelVelocity: { current: number },
  lastWheelVelocity: { current: number },
  appVelocity: { current: number },
  appLean: MotionValue<number>,
  oppositeWheel: MotionValue<number>,
  stopMomentum: () => void,
  animateMomentum: (angle: number, velocity: number) => void,
  normalizeAngleDiff: (target: number, current: number) => number,
  minVelocityThreshold: number,
  minDragDistance: number,
  leanMultiplier: number
) {
  const startAngle = useRef<number | null>(null)
  const lastPointerTime = useRef<number>(0)
  const lastPointerAngle = useRef<number>(0)
  const velocityHistory = useRef<number[]>([])
  const totalDragDistance = useRef<number>(0)
  const lastPointerVelocity = useRef<number>(0)

  function onPointerDown(e: React.PointerEvent) {
    if (!containerRef.current) return

    stopMomentum()
    dragging.current = true

    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angle = getAngle(cx, cy, e.clientX, e.clientY)
    const currentWheelAngle = wheel.get()

    startAngle.current = angle - currentWheelAngle
    lastPointerAngle.current = angle
    lastPointerTime.current = Date.now()
    velocityHistory.current = []
    totalDragDistance.current = 0

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging.current || !containerRef.current || startAngle.current === null) return

    const rect = containerRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const angle = getAngle(cx, cy, e.clientX, e.clientY)
    const wheelAngle = angle - startAngle.current

    wheel.jump(wheelAngle)

    const now = Date.now()
    const deltaTime = now - lastPointerTime.current
    let currentVelocity = 0

    if (deltaTime > 0 && deltaTime < 100) {
      const deltaAngle = normalizeAngleDiff(angle, lastPointerAngle.current)
      totalDragDistance.current += Math.abs(deltaAngle)
      currentVelocity = (deltaAngle / deltaTime) * 1000
      lastPointerVelocity.current = currentVelocity

      if (Math.abs(deltaAngle) > 0.1) {
        velocityHistory.current.push(currentVelocity)
        if (velocityHistory.current.length > 5) {
          velocityHistory.current.shift()
        }
      }

      lastPointerAngle.current = angle
      lastPointerTime.current = now
    }

    const wheelDeltaAngle = normalizeAngleDiff(wheelAngle, prevWheelAngle.current)
    lastWheelVelocity.current = wheelVelocity.current
    wheelVelocity.current = wheelDeltaAngle
    prevWheelAngle.current = wheelAngle
    appVelocity.current = -wheelDeltaAngle

    if (Math.abs(currentVelocity) > 0.1) {
      appLean.set(currentVelocity * leanMultiplier)
    } else {
      appLean.set(0)
    }

    oppositeWheel.set(-wheelAngle)
  }

  function onPointerUp(_e: PointerEvent) {
    dragging.current = false
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)

    const abruptStopLean = lastPointerVelocity.current * leanMultiplier
    appLean.set(abruptStopLean)

    // Only calculate momentum if we actually have velocity history
    const avgVelocity =
      velocityHistory.current.length > 0
        ? velocityHistory.current.reduce((a, b) => a + b, 0) / velocityHistory.current.length
        : 0

    // Only apply momentum if:
    // 1. We have sufficient velocity
    // 2. We dragged a significant distance
    // 3. The average velocity is actually meaningful (not just noise)
    if (
      Math.abs(avgVelocity) > minVelocityThreshold &&
      totalDragDistance.current > minDragDistance &&
      velocityHistory.current.length > 0
    ) {
      animateMomentum(wheel.get(), avgVelocity)
    }

    startAngle.current = null
    velocityHistory.current = []
    totalDragDistance.current = 0
    lastPointerVelocity.current = 0
  }

  return { onPointerDown }
}

