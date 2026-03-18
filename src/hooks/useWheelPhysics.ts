import { useSpring, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { MotionValue } from 'motion/react'

/**
 * Multiplies wheel velocity into the temporary "lean" applied to app cards.
 * Higher values make cards tilt more aggressively while spinning.
 */
const LEAN_MULTIPLIER = 0.06

/**
 * Caps how far cards are allowed to lean in either direction.
 */
const MAX_APP_LEAN = 6

/**
 * Minimum wheel velocity required to treat a drag release as momentum-worthy.
 * Lower values make the wheel continue spinning more often after release.
 */
const MIN_VELOCITY_THRESHOLD = 15

/**
 * Minimum pointer movement before a gesture should count as a drag.
 * Helps distinguish clicks/taps from real wheel dragging.
 */
const MIN_DRAG_DISTANCE = 3

const WHEEL_SPRING = {
  stiffness: 320,
  damping: 26,
  mass: 1,
  restDelta: 0.1,
}

const OPPOSITE_WHEEL_SPRING = {
  stiffness: 320,
  damping: 18,
  mass: 0.7,
  restDelta: 0.1,
}

const APP_MOMENTUM_SPRING = {
  stiffness: 180,
  damping: 16,
  mass: 0.8,
  restDelta: 0.1,
}

const APP_LEAN_SPRING = {
  stiffness: 90,
  damping: 18,
  mass: 0.8,
  restDelta: 0.1,
}

/**
 * Normalizes the signed angular difference so it always falls within [-180, 180].
 * This prevents large jumps when angles cross the 0/360 boundary.
 */
function normalizeAngleDiff(target: number, current: number): number {
  let diff = target - current

  while (diff > 180) diff -= 360
  while (diff < -180) diff += 360

  return diff
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export type UseWheelPhysicsReturn = {
  /**
   * Main wheel rotation in degrees.
   * This is the value you usually bind to the rotating ring container.
   */
  wheel: MotionValue<number>

  /**
   * Counter-rotation in degrees for the inner app cards.
   * Keeps cards visually upright while the wheel rotates.
   */
  oppositeWheel: MotionValue<number>

  /**
   * Final app/card rotation in degrees after combining:
   * - opposite wheel rotation
   * - app momentum
   * - temporary lean
   */
  combinedAppRotation: MotionValue<number>

  /**
   * Whether the user is currently dragging the wheel.
   * Stored as a ref so it can be read/written without re-rendering.
   */
  dragging: React.RefObject<boolean>

  /**
   * Previously observed wheel angle in degrees.
   * Used to calculate per-frame angle delta / velocity.
   */
  prevWheelAngle: React.RefObject<number>

  /**
   * Latest wheel angular delta per frame in degrees.
   * Positive and negative values indicate direction.
   */
  wheelVelocity: React.RefObject<number>

  /**
   * Previous frame's wheel angular delta.
   * Useful when deriving stop behavior or abrupt lean reactions.
   */
  lastWheelVelocity: React.RefObject<number>

  /**
   * App/card angular velocity derived from the wheel, usually inverted.
   * Intended for card-specific visual motion effects.
   */
  appVelocity: React.RefObject<number>

  /**
   * Temporary extra tilt/lean applied to the app cards in degrees.
   * Driven mainly by rotational speed to create a more physical feel.
   */
  appLean: MotionValue<number>

  /**
   * Additional app/card rotational momentum in degrees.
   * Can be used to let cards lag behind or overshoot independently.
   */
  appMomentum: MotionValue<number>

  /**
   * Cancels any active momentum animation frame loop.
   */
  stopMomentum: () => void

  /**
   * Clears momentum, lean, and cached velocities so the cards immediately
   * return to a neutral resting state.
   */
  resetMotionState: () => void

  /**
   * Starts an inertial spin from a given angle and velocity.
   */
  animateMomentum: (
    initialAngle: number,
    velocity: number,
    friction?: number,
    minVelocity?: number
  ) => void

  /**
   * Utility for finding the shortest signed angular path between two angles.
   */
  normalizeAngleDiff: (target: number, current: number) => number

  /**
   * Exported threshold used by drag logic to decide whether release velocity
   * is high enough to trigger inertia.
   */
  MIN_VELOCITY_THRESHOLD: number

  /**
   * Exported threshold used by drag logic to decide when movement becomes a drag.
   */
  MIN_DRAG_DISTANCE: number

  /**
   * Exported multiplier used when converting velocity into card lean.
   */
  LEAN_MULTIPLIER: number
}

export function useWheelPhysics(initialAngle: number = -18): UseWheelPhysicsReturn {
  /**
   * Main wheel rotation spring.
   */
  const wheel = useSpring(initialAngle, WHEEL_SPRING)

  /**
   * Counter-rotation spring that keeps app cards visually upright.
   */
  const oppositeWheel = useSpring(-initialAngle, OPPOSITE_WHEEL_SPRING)

  /**
   * Independent rotational lag/momentum for app cards.
   */
  const appMomentum = useSpring(0, APP_MOMENTUM_SPRING)

  /**
   * Extra temporary tilt applied to cards based on spin velocity.
   */
  const appLean = useSpring(0, APP_LEAN_SPRING)

  /**
   * Base card rotation before lean is added.
   */
  const baseAppRotation = useTransform([oppositeWheel, appMomentum], (values: number[]) => {
    const counterRotation = values[0] ?? 0
    const momentum = values[1] ?? 0
    return counterRotation + momentum
  })

  /**
   * Final card rotation including temporary velocity-driven lean.
   */
  const combinedAppRotation = useTransform([baseAppRotation, appLean], (values: number[]) => {
    const baseRotation = values[0] ?? 0
    const lean = values[1] ?? 0
    return baseRotation + lean
  })

  /**
   * True while the pointer is actively dragging the wheel.
   */
  const dragging = useRef<boolean>(false)

  /**
   * Last processed wheel angle, used for delta calculations.
   */
  const prevWheelAngle = useRef<number>(wheel.get())

  /**
   * Most recent frame-to-frame angular delta of the wheel.
   */
  const wheelVelocity = useRef<number>(0)

  /**
   * Previous value of wheelVelocity.
   */
  const lastWheelVelocity = useRef<number>(0)

  /**
   * App-specific angular velocity, currently mirrored/inverted from wheel delta.
   */
  const appVelocity = useRef<number>(0)

  /**
   * Active requestAnimationFrame id for inertia animation.
   * Null means no momentum loop is running.
   */
  const momentumRafId = useRef<number | null>(null)

  useEffect(() => {
    return wheel.on('change', (angle) => {
      if (dragging.current) {
        oppositeWheel.set(-angle)
        return
      }

      const deltaAngle = normalizeAngleDiff(angle, prevWheelAngle.current)

      prevWheelAngle.current = angle
      lastWheelVelocity.current = wheelVelocity.current
      wheelVelocity.current = deltaAngle
      appVelocity.current = -deltaAngle

      const velocityDegPerSecond = deltaAngle * 60
      const nextLean = clamp(velocityDegPerSecond * LEAN_MULTIPLIER, -MAX_APP_LEAN, MAX_APP_LEAN)

      appLean.set(nextLean)
      oppositeWheel.set(-angle)
    })
  }, [wheel, oppositeWheel, appLean])

  function stopMomentum() {
    if (momentumRafId.current !== null) {
      cancelAnimationFrame(momentumRafId.current)
      momentumRafId.current = null
    }
  }

  function resetMotionState() {
    stopMomentum()

    const currentAngle = wheel.get()

    dragging.current = false
    prevWheelAngle.current = currentAngle
    wheelVelocity.current = 0
    lastWheelVelocity.current = 0
    appVelocity.current = 0

    oppositeWheel.set(-currentAngle)
    appMomentum.set(0)
    appLean.set(0)
  }

  function animateMomentum(
    initialAngle: number,
    velocity: number,
    friction: number = 0.92,
    minVelocity: number = 1
  ) {
    stopMomentum()

    let currentAngle = initialAngle
    let currentVelocity = velocity
    let lastTime: number | null = null

    const animate = (time: number) => {
      if (lastTime === null) {
        lastTime = time
        momentumRafId.current = requestAnimationFrame(animate)
        return
      }

      const deltaSeconds = (time - lastTime) / 1000
      lastTime = time

      // Convert friction into frame-rate independent decay.
      const decay = Math.pow(friction, deltaSeconds * 60)
      currentVelocity *= decay

      if (Math.abs(currentVelocity) < minVelocity) {
        wheel.jump(currentAngle)
        oppositeWheel.jump(-currentAngle)

        prevWheelAngle.current = currentAngle
        wheelVelocity.current = 0
        lastWheelVelocity.current = 0
        appVelocity.current = 0

        appMomentum.set(0)
        appLean.set(0)
        momentumRafId.current = null
        return
      }

      const angleDelta = currentVelocity * deltaSeconds
      const previousAngle = currentAngle
      currentAngle += angleDelta

      wheel.jump(currentAngle)
      oppositeWheel.jump(-currentAngle)

      const deltaAngle = normalizeAngleDiff(currentAngle, previousAngle)

      lastWheelVelocity.current = wheelVelocity.current
      wheelVelocity.current = deltaAngle
      prevWheelAngle.current = currentAngle
      appVelocity.current = -deltaAngle

      appLean.set(clamp(currentVelocity * LEAN_MULTIPLIER, -MAX_APP_LEAN, MAX_APP_LEAN))

      momentumRafId.current = requestAnimationFrame(animate)
    }

    momentumRafId.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    return () => {
      stopMomentum()
    }
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
    resetMotionState,
    animateMomentum,
    normalizeAngleDiff,
    MIN_VELOCITY_THRESHOLD,
    MIN_DRAG_DISTANCE,
    LEAN_MULTIPLIER,
  }
}
