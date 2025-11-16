import { useEffect, useState } from 'react'
import { LoadingScreen } from './components'
import { AppRing } from './components/appRing'
import { motion } from 'motion/react'
import type { AppType } from './packages/signature'
const apps: AppType[] = [
  {
    name: 'CS2 Server Manager',
    description: 'Manage your CS2 servers with ease',
    image: '/csm-icon.svg',
  },
  {
    name: 'Gryt.chat',
    description: 'A chat application for your friends',
    image: '/gryt-icon.svg',
  },
  {
    name: 'Matchzy Auto Tournament',
    description: 'Automated tournament matches',
    image: '/mat-icon.svg',
  },
  {
    name: 'WebSocket Voice',
    description: 'Voice communication through WebRTC and WebSockets',
    image: '/webrtc-icon.svg',
  },
  {
    name: 'Steam Provider Auth.js',
    description: 'Custom Steam provider for Auth.js (NextAuth.js v5)',
    image: '/steam-icon.svg',
  },
  {
    name: 'Portfolio',
    description: 'This portfolio website built with React, TypeScript, and Motion',
    image: '/person-icon.svg',
  },
  {
    name: 'Golf MK4 Remote Start',
    description: 'Arduino sketch for remote starting a Volkswagen Golf GTI MK4',
    image: '/car-icon.svg',
  },
  {
    name: 'GameObject Sorter',
    description: 'Unity tool for organizing and sorting game objects',
    image: '/grid-icon.svg',
  },
  {
    name: 'Game Development',
    description: 'Game development projects using Godot Engine',
    image: '/game-icon.svg',
  },
  {
    name: 'Norsk Tipping',
    description: 'Professional work for Norsk Tipping',
    image: '/nt-icon.svg',
  },
]

function App() {
  const [showStatus, setShowStatus] = useState(false)
  const [hoveredApp, setHoveredApp] = useState<AppType | null>(null)
  const [oldHoveredApp, setOldHoveredApp] = useState<AppType | null>(null)

  useEffect(() => {
    if (hoveredApp) {
      setOldHoveredApp(hoveredApp)
    }
  }, [hoveredApp])

  return (
    <main className="fixed inset-0 grid place-items-center">
      <LoadingScreen setShowStatus={setShowStatus} />
      <AppRing
        show={showStatus}
        apps={apps}
        radius={256}
        setHoveredApp={setHoveredApp}
        hoveredApp={hoveredApp}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="z-10 flex flex-col items-center justify-center gap-4"
      >
        <motion.div
          // Fix: Use 1 (not 100%) to be fully visible
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredApp ? 1 : 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="flex max-w-[320px] flex-col items-center justify-center gap-3 text-center"
        >
          <h2 className="text-2xl leading-tight font-bold tracking-tight text-white">
            {oldHoveredApp?.name}
          </h2>
          <p className="text-base leading-relaxed font-normal tracking-wide text-gray-300/90">
            {oldHoveredApp?.description}
          </p>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default App
