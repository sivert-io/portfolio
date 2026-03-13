import { motion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import type { AppType } from '../packages/signature'
import { useWheelPhysics } from '../hooks/useWheelPhysics'
import { useWheelDrag } from '../hooks/useWheelDrag'

const CARD_SIZE = 64
const OUTSIDE_SCALE = 0.5

function getAppPositions(count: number, radius: number) {
  const angleStep = (2 * Math.PI) / count
  const positions = []
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      outside_x: Math.cos(angle) * (radius + CARD_SIZE) * OUTSIDE_SCALE,
      outside_y: Math.sin(angle) * (radius + CARD_SIZE) * OUTSIDE_SCALE,
    })
  }
  return positions
}

function getShuffledIndexes(length: number) {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function AppRing({
  show,
  apps,
  radius,
  setHoveredApp,
  hoveredApp,
  onAppClick,
  openingProjectSlug,
}: {
  show: boolean
  apps: AppType[]
  radius: number
  setHoveredApp: (app: AppType | null) => void
  hoveredApp: AppType | null
  onAppClick: (app: AppType) => void
  openingProjectSlug?: string | null
}) {
  // Stable random shuffle order
  const shuffledIndexes = useRef<number[]>([])
  if (shuffledIndexes.current.length !== apps.length) {
    shuffledIndexes.current = getShuffledIndexes(apps.length)
  }

  const positions = useMemo(() => getAppPositions(apps.length, radius), [apps.length, radius])
  const containerRef = useRef<HTMLDivElement>(null)

  // Wheel physics hook
  const {
    wheel,
    combinedAppRotation,
    dragging,
    prevWheelAngle,
    wheelVelocity,
    lastWheelVelocity,
    appVelocity,
    appLean,
    oppositeWheel,
    stopMomentum,
    animateMomentum,
    normalizeAngleDiff,
    MIN_VELOCITY_THRESHOLD,
    MIN_DRAG_DISTANCE,
    LEAN_MULTIPLIER,
  } = useWheelPhysics(18)

  // Drag handlers
  const { onPointerDown } = useWheelDrag(
    wheel,
    containerRef,
    dragging,
    prevWheelAngle,
    wheelVelocity,
    lastWheelVelocity,
    appVelocity,
    appLean,
    oppositeWheel,
    stopMomentum,
    animateMomentum,
    normalizeAngleDiff,
    MIN_VELOCITY_THRESHOLD,
    MIN_DRAG_DISTANCE,
    LEAN_MULTIPLIER
  )

  // Spin-in animation when show becomes true
  const hasAnimatedIn = useRef(false)
  useEffect(() => {
    if (show && !hasAnimatedIn.current) {
      hasAnimatedIn.current = true
      animateMomentum(wheel.get(), 50, 0.99, 0.5)
    } else if (!show) {
      hasAnimatedIn.current = false
      stopMomentum()
    }
  }, [show, wheel, animateMomentum, stopMomentum])

  return (
    <div ref={containerRef} className="absolute z-10 select-none">
      {/* 
        Attach pointer events to the motion.div that holds the wheel. 
        Only start drag when show is true and if pointer is not in transition.
      */}
      <motion.div
        style={{
          rotate: wheel,
          x: 0,
          y: 0,
          pointerEvents: show ? 'all' : 'none',
        }}
        onPointerDown={show ? onPointerDown : undefined}
      >
        {positions.map((pos, i) => {
          return (
            <motion.div
              key={i}
              initial={{
                x: pos.outside_x - CARD_SIZE / 2,
                y: pos.outside_y - CARD_SIZE / 2,
                opacity: 0,
              }}
              animate={{
                x: show ? pos.x - CARD_SIZE / 2 : pos.outside_x - CARD_SIZE / 2,
                y: show ? pos.y - CARD_SIZE / 2 : pos.outside_y - CARD_SIZE / 2,
                scale: openingProjectSlug && openingProjectSlug !== apps[i].slug ? 0.0 : 1.0,
                opacity: show ? 1 : 0,
              }}
              transition={{
                delay: !openingProjectSlug ? i * 0.05 : 0,
                type: 'spring',
                stiffness: 60,
                damping: 10,
              }}
              className="absolute"
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                marginLeft: 0,
                marginTop: 0,
                touchAction: 'none', // Required for pointer events to behave as expected
              }}
            >
              <motion.div
                style={{
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rotate: combinedAppRotation,
                }}
              >
                <motion.img
                  onHoverStart={() => setHoveredApp(apps[i])}
                  onHoverEnd={() => setHoveredApp(null)}
                  onClick={() => {
                    if (!openingProjectSlug) {
                      onAppClick(apps[i])
                      setHoveredApp(null)
                    }
                  }}
                  animate={{
                    scale: hoveredApp === apps[i] ? 1.25 : 1,
                    opacity: openingProjectSlug === apps[i].slug || !openingProjectSlug ? 1 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 25,
                  }}
                  className="cursor-pointer"
                  style={{
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                  }}
                  src={apps[i].image}
                  alt={apps[i].name}
                  draggable={false}
                  // Prevent drag image ghost
                  onDragStart={(e) => {
                    e.preventDefault()
                  }}
                />
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
