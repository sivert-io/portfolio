import { motion } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import type { AppType } from '../packages/signature'
import { useWheelPhysics } from '../hooks/useWheelPhysics'
import { useWheelDrag } from '../hooks/useWheelDrag'

const CARD_SIZE = 72
const OUTSIDE_SCALE = 0.5
const CLICK_DRAG_THRESHOLD = 6

type AppRingProps = {
  apps: AppType[]
  radius: number
  setHoveredApp: (app: AppType | null) => void
  hoveredApp: AppType | null
  onAppClick: (app: AppType) => void
  openingProjectSlug?: string | null
  playIntroSpin?: boolean
  /**
   * A stable identity for this ring instance, e.g. "base" or "projects".
   * Used to replay intro motion when the ring content changes.
   */
  introKey: string
  /**
   * Whether the ring is actually visible on screen right now.
   */
  isVisible?: boolean
}

function getAppPositions(count: number, radius: number) {
  if (count <= 0) return []

  const angleStep = (2 * Math.PI) / count

  return Array.from({ length: count }, (_, i) => {
    const angle = i * angleStep
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    return {
      x: cos * radius,
      y: sin * radius,
      outsideX: cos * (radius + CARD_SIZE) * OUTSIDE_SCALE,
      outsideY: sin * (radius + CARD_SIZE) * OUTSIDE_SCALE,
    }
  })
}

export function AppRing({
  apps,
  radius,
  setHoveredApp,
  hoveredApp,
  onAppClick,
  openingProjectSlug,
  playIntroSpin = true,
  introKey,
  isVisible = true,
}: AppRingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const positions = useMemo(() => getAppPositions(apps.length, radius), [apps.length, radius])

  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const didDragRef = useRef(false)
  const lastPlayedIntroKeyRef = useRef<string | null>(null)

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
    resetMotionState,
    animateMomentum,
    normalizeAngleDiff,
    MIN_VELOCITY_THRESHOLD,
    MIN_DRAG_DISTANCE,
    LEAN_MULTIPLIER,
  } = useWheelPhysics(18)

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

  useEffect(() => {
    if (!playIntroSpin || !isVisible || apps.length === 0) return
    if (lastPlayedIntroKeyRef.current === introKey) return

    let raf1 = 0
    let raf2 = 0

    raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        lastPlayedIntroKeyRef.current = introKey
        resetMotionState()
        animateMomentum(wheel.get(), apps.length * -50, 0.98, 0.5)
      })
    })

    return () => {
      window.cancelAnimationFrame(raf1)
      window.cancelAnimationFrame(raf2)
    }
  }, [animateMomentum, apps.length, introKey, isVisible, playIntroSpin, resetMotionState, wheel])

  if (apps.length === 0) {
    return null
  }

  return (
    <motion.div ref={containerRef} className="absolute z-10 select-none">
      <motion.div style={{ rotate: wheel }} onPointerDown={onPointerDown}>
        {apps.map((app, i) => {
          const pos = positions[i]
          const isOpeningAnotherApp = !!openingProjectSlug && openingProjectSlug !== app.slug
          const isVisibleCard = !openingProjectSlug || openingProjectSlug === app.slug
          const isHovered = hoveredApp?.slug === app.slug

          return (
            <motion.div
              key={app.slug}
              initial={{
                x: pos.outsideX - CARD_SIZE / 2,
                y: pos.outsideY - CARD_SIZE / 2,
                opacity: 0,
                scale: 0.6,
              }}
              animate={{
                x: pos.x - CARD_SIZE / 2,
                y: pos.y - CARD_SIZE / 2,
                scale: isOpeningAnotherApp ? 0 : 1,
                opacity: isVisibleCard ? 1 : 0,
              }}
              transition={{
                delay: i * 0.05,
                type: 'spring',
                stiffness: 70,
                damping: 14,
              }}
              className="absolute"
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                touchAction: 'none',
              }}
            >
              <motion.div
                className="flex items-center justify-center overflow-hidden rounded-3xl border border-white p-2 text-center font-medium text-white"
                style={{
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  rotate: combinedAppRotation,
                  cursor: openingProjectSlug ? 'default' : 'pointer',
                  pointerEvents:
                    openingProjectSlug && openingProjectSlug !== app.slug ? 'none' : 'auto',
                }}
                onPointerDown={(e) => {
                  pointerStartRef.current = { x: e.clientX, y: e.clientY }
                  didDragRef.current = false
                }}
                onPointerMove={(e) => {
                  const start = pointerStartRef.current
                  if (!start || didDragRef.current) return

                  const dx = e.clientX - start.x
                  const dy = e.clientY - start.y
                  const distance = Math.hypot(dx, dy)

                  if (distance >= CLICK_DRAG_THRESHOLD || dragging.current) {
                    didDragRef.current = true
                  }
                }}
                onPointerUp={() => {
                  window.setTimeout(() => {
                    pointerStartRef.current = null
                    didDragRef.current = false
                  }, 0)
                }}
                onPointerCancel={() => {
                  pointerStartRef.current = null
                  didDragRef.current = false
                }}
                onHoverStart={() => {
                  if (!dragging.current) {
                    setHoveredApp(app)
                  }
                }}
                onHoverEnd={() => {
                  setHoveredApp(null)
                }}
                onClick={(e) => {
                  if (openingProjectSlug || dragging.current || didDragRef.current) {
                    e.preventDefault()
                    e.stopPropagation()
                    return
                  }

                  resetMotionState()
                  onAppClick(app)
                  setHoveredApp(null)
                }}
                animate={{
                  scale: isHovered ? 1.25 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 25,
                }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                role="button"
                aria-label={app.name}
                tabIndex={openingProjectSlug ? -1 : 0}
                onKeyDown={(e) => {
                  if (openingProjectSlug) return

                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    resetMotionState()
                    onAppClick(app)
                    setHoveredApp(null)
                  }
                }}
              >
                {app.image.length > 1 ? (
                  <motion.img
                    className="pointer-events-none rounded-2xl"
                    src={app.image}
                    alt={app.name}
                    draggable={false}
                    onDragStart={(e) => {
                      e.preventDefault()
                    }}
                  />
                ) : (
                  <motion.p>{app.name}</motion.p>
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
