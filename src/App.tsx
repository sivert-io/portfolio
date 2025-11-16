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
          className="flex flex-col items-center justify-center gap-2"
        >
          <p className="text-3xl font-bold">{oldHoveredApp?.name}</p>
          <p className="text-lg font-normal">{oldHoveredApp?.description}</p>
        </motion.div>
      </motion.div>
    </main>
  )
}

export default App
