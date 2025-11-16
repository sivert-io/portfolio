import { useSpring, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'

const LEAN_MULTIPLIER = 0.3
const MIN_VELOCITY_THRESHOLD = 15
const MIN_DRAG_DISTANCE = 3

function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current
  while (diff > 180) diff -= 360
  while (diff < -180) diff += 360
  return diff
}

export function useWheelPhysics(initialAngle: number = -18) {
  // Springs for rotation
  const wheel = useSpring(initialAngle, { stiffness: 320, damping: 26, mass: 1, restDelta: 0.1 })
  const oppositeWheel = useSpring(-initialAngle, {
    stiffness: 320,
    damping: 14,
    mass: 0.6,
    restDelta: 0.1,
  })
  const appMomentum = useSpring(0, { stiffness: 200, damping: 2, mass: 0.8, restDelta: 0.1 })
  const appLean = useSpring(0, { stiffness: 25, damping: 0.5, mass: 0.3, restDelta: 0.1 })

  // Combined app rotation
  const baseAppRotation = useTransform(
    [oppositeWheel, appMomentum],
    (values: number[]) => values[0] + values[1]
  )
  const combinedAppRotation = useTransform(
    [baseAppRotation, appLean],
    (values: number[]) => values[0] + values[1]
  )

  // State refs
  const dragging = useRef(false)
  const prevWheelAngle = useRef(wheel.get())
  const wheelVelocity = useRef(0)
  const lastWheelVelocity = useRef(0)
  const appVelocity = useRef(0)
  const momentumRafId = useRef<number | null>(null)

  // Update lean based on wheel velocity
  useEffect(() => {
    return wheel.on('change', (v) => {
      if (dragging.current) {
        oppositeWheel.set(-v)
        return
      }

      const deltaAngle = normalizeAngleDiff(v, prevWheelAngle.current)
      prevWheelAngle.current = v
      lastWheelVelocity.current = wheelVelocity.current
      wheelVelocity.current = deltaAngle
      appVelocity.current = -deltaAngle

      const velocityDegPerSec = deltaAngle * 60
      appLean.set(velocityDegPerSec * LEAN_MULTIPLIER)
      oppositeWheel.set(-v)
    })
  }, [wheel, oppositeWheel, appLean])

  function stopMomentum() {
    if (momentumRafId.current !== null) {
      cancelAnimationFrame(momentumRafId.current)
      momentumRafId.current = null
    }
  }

  function animateMomentum(
    initialAngle: number,
    velocity: number,
    friction: number = 0.92,
    minVelocity: number = 1
  ) {
    stopMomentum()

    const startTime = Date.now()
    let currentAngle = initialAngle
    let currentVelocity = velocity

    const animate = () => {
      const deltaTime = (Date.now() - startTime) / 1000
      currentVelocity = velocity * Math.pow(friction, deltaTime * 60)

      if (Math.abs(currentVelocity) < minVelocity) {
        wheel.jump(currentAngle)
        oppositeWheel.jump(-currentAngle)
        const abruptStopVelocity = lastWheelVelocity.current * 60
        appLean.set(abruptStopVelocity * LEAN_MULTIPLIER)
        // Reset app momentum when wheel stops - don't apply momentum if velocity is too low
        appMomentum.set(0)
        momentumRafId.current = null
        return
      }

      const frameDelta = currentVelocity * (1 / 60)
      const angleDelta = normalizeAngleDiff(currentAngle + frameDelta, currentAngle)
      const prevAngle = currentAngle
      currentAngle = currentAngle + angleDelta

      wheel.jump(currentAngle)
      const deltaAngle = normalizeAngleDiff(currentAngle, prevAngle)
      lastWheelVelocity.current = wheelVelocity.current
      wheelVelocity.current = deltaAngle
      prevWheelAngle.current = currentAngle
      appVelocity.current = -deltaAngle
      appLean.set(currentVelocity * LEAN_MULTIPLIER)
      oppositeWheel.jump(-currentAngle)

      momentumRafId.current = requestAnimationFrame(animate)
    }

    momentumRafId.current = requestAnimationFrame(animate)
  }

  // Cleanup
  useEffect(() => {
    return () => stopMomentum()
  }, [])

  return {
    wheel,
    oppositeWheel,
    combinedAppRotation,
    dragging,
    prevWheelAngle,
    wheelVelocity,
    lastWheelVelocity,
    appVelocity,
    appLean,
    appMomentum,
    stopMomentum,
    animateMomentum,
    normalizeAngleDiff,
    MIN_VELOCITY_THRESHOLD,
    MIN_DRAG_DISTANCE,
    LEAN_MULTIPLIER,
  }
}

