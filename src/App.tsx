import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LoadingScreen, Navbar } from './components'
import { usePage } from './hooks'
import { HomePage, AboutPage, ContactPage, ProjectsPage, WorkPage } from './pages'

function App() {
  const { currentPage, markContentReady } = usePage()

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      markContentReady()
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [currentPage, markContentReady])

  return (
    <>
      <Navbar key="navbar" />
      <LoadingScreen />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="fixed inset-0 overflow-auto pt-[128px]"
          key={currentPage}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="px-8 pb-8">
            {currentPage === 'home' && <HomePage key="home-page" />}
            {currentPage === 'work' && <WorkPage key="work-page" />}
            {currentPage === 'about' && <AboutPage key="about-page" />}
            {currentPage === 'contact' && <ContactPage key="contact-page" />}
            {currentPage === 'projects' && <ProjectsPage key="projects-page" />}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default App
