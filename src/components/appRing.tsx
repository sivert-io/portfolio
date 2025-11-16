import { motion, useSpring } from 'motion/react'
import { useEffect, useMemo, useRef } from 'react'
import type { AppType } from '../packages/signature'

const CARD_SIZE = 64

function getAppPositions(count: number, radius: number) {
  const angleStep = (2 * Math.PI) / count
  const positions = []
  for (let i = 0; i < count; i++) {
    const angle = i * angleStep
    // The card will be centered at the computed (x, y) position.
    positions.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      // For "outside" (offscreen) animation
      outside_x: Math.cos(angle) * (radius + CARD_SIZE) * 2,
      outside_y: Math.sin(angle) * (radius + CARD_SIZE) * 2,
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
}: {
  show: boolean
  apps: AppType[]
  radius: number
  setHoveredApp: (app: AppType | null) => void
  hoveredApp: AppType | null
}) {
  // Stable random shuffle order
  const shuffledIndexes = useRef<number[]>([])
  if (shuffledIndexes.current.length !== apps.length) {
    shuffledIndexes.current = getShuffledIndexes(apps.length)
  }

  const positions = useMemo(() => getAppPositions(apps.length, radius), [apps.length, radius])

  const wheel = useSpring(-18, { stiffness: 2, damping: 1 })
  const oppositeWheel = useSpring(18, {
    stiffness: 320,
    damping: 14,
    mass: 0.6,
    restDelta: 0.1,
  })

  // --- Magnet Effect: appRing moves slightly toward cursor ---
  // (REMOVED) Magnet Effect and its related code.
  // --- End Magnet Effect ---

  useEffect(() => {
    function rotateWheel() {
      if (document.hasFocus()) {
        const newRot = wheel.get() + (Math.random() > 0.5 ? 1 : -1) * 67
        wheel.set(newRot)
      }
    }

    rotateWheel()

    const interval = setInterval(() => {
      rotateWheel()
    }, 9000)
    return () => clearInterval(interval)
  }, [wheel])

  useEffect(() => {
    return wheel.on('change', (v) => oppositeWheel.set(-v))
  }, [wheel, oppositeWheel])

  return (
    <div className="absolute z-10">
      <motion.div
        style={{
          rotate: wheel,
          x: 0,
          y: 0,
        }}
      >
        {positions.map((pos, i) => {
          const shuffleIdx = shuffledIndexes.current.indexOf(i)
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
                opacity: show ? 1 : 0,
              }}
              transition={{
                delay: shuffleIdx * 0.1,
                type: 'spring',
                stiffness: 60,
                damping: 10,
              }}
              className="absolute"
              style={{
                width: CARD_SIZE,
                height: CARD_SIZE,
                // Center the card's center to the computed ring position
                marginLeft: 0,
                marginTop: 0,
              }}
            >
              <motion.div
                style={{
                  width: CARD_SIZE,
                  height: CARD_SIZE,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rotate: oppositeWheel,
                  // No special transformOrigin needed; default: center
                }}
              >
                <motion.img
                  onHoverStart={() => setHoveredApp(apps[i])}
                  onHoverEnd={() => setHoveredApp(null)}
                  onClick={() => setHoveredApp(apps[i])}
                  animate={{ scale: hoveredApp === apps[i] ? 1.5 : 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 50,
                  }}
                  className="cursor-pointer"
                  style={{
                    width: CARD_SIZE,
                    height: CARD_SIZE,
                  }}
                  src={apps[i].image}
                  alt={apps[i].name}
                />
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
