import { useEffect, useState } from 'react'
import { LoadingScreen } from './components'
import { AppRing } from './components/appRing'
import { motion } from 'motion/react'
import type { AppType } from './packages/signature'
const apps: AppType[] = [
  {
    name: 'Gryt.chat',
    description: 'Description 1',
    image: 'image1.jpg',
  },
  {
    name: 'Matchzy Auto Tournament',
    description: 'Description 2',
    image: 'image2.jpg',
  },
  {
    name: 'CS2 Server Manager',
    description: 'Description 3',
    image: 'image3.jpg',
  },
  {
    name: 'Edition 35',
    description: 'Description 4',
    image: 'image4.jpg',
  },
  {
    name: 'About Me',
    description: 'Description 5',
    image: 'image5.jpg',
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
        animate={showStatus ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center gap-4"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={hoveredApp ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
          className="text-3xl font-medium"
        >
          {oldHoveredApp?.name}
        </motion.p>

        <p className="text-xs tracking-[1em] uppercase">Choose a card</p>
      </motion.div>
    </main>
  )
}

export default App
