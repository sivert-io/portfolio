import { useEffect, type ComponentType } from 'react'
import { AnimatePresence } from 'motion/react'
import { LoadingScreen, Navbar } from './components'
import { usePage } from './hooks'
import { HomePage, AboutPage, ContactPage, ProjectsPage, WorkPage } from './pages'

const SITE_TITLE = 'Sivert Gullberg Hansen'

const PAGE_TITLES: Record<string, string> = {
  home: SITE_TITLE,
  work: `${SITE_TITLE} — Selected Work`,
  about: `${SITE_TITLE} — About`,
  contact: `${SITE_TITLE} — Contact`,
  projects: `${SITE_TITLE} — Projects`,
}

function App() {
  const { currentPage, markContentReady } = usePage()

  useEffect(() => {
    document.title = PAGE_TITLES[currentPage] || SITE_TITLE
    // Tell the store to hide the intro loader after the first frame after change
    const frame = requestAnimationFrame(markContentReady)
    return () => cancelAnimationFrame(frame)
  }, [currentPage, markContentReady])

  return (
    <>
      <Navbar />
      <LoadingScreen />
      <div className="fixed inset-0 overflow-auto pt-[128px]">
        <div className="px-8 pb-8">
          <AnimatePresence mode="wait" initial={false}>
            {currentPage === 'home' && <HomePage key="home" />}
            {currentPage === 'work' && <WorkPage key="work" />}
            {currentPage === 'about' && <AboutPage key="about" />}
            {currentPage === 'contact' && <ContactPage key="contact" />}
            {currentPage === 'projects' && <ProjectsPage key="projects" />}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}

export default App
