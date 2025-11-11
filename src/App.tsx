import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LoadingScreen, Navbar } from './components'
import { usePage } from './hooks'
import { HomePage, AboutPage, ContactPage, ProjectsPage, WorkPage } from './pages'
import { pages as pageEntries } from 'velite'

const SITE_TITLE = 'Sivert Gullberg Hansen'

const PATH_TO_PAGE = new Map<string, string>([
  ['/', 'home'],
  ['', 'home'],
  ['/home', 'home'],
  ['/work', 'work'],
  ['/projects', 'projects'],
  ['/about', 'about'],
  ['/contact', 'contact'],
])

function normalizePath(path: string) {
  if (!path) return '/'
  const trimmed = path.trim().replace(/\/+$/, '')
  if (trimmed === '') return '/'
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return withLeadingSlash.toLowerCase()
}

function pageToPath(page: string) {
  return page === 'home' ? '/' : `/${page}`
}

function pathToPage(path: string) {
  return PATH_TO_PAGE.get(normalizePath(path)) ?? 'home'
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function resolveTitle(page: string, titleMap: Map<string, string>) {
  if (page === 'home') {
    return SITE_TITLE
  }
  const label = titleMap.get(page) ?? capitalize(page)
  return `${SITE_TITLE} — ${label}`
}

function App() {
  const { currentPage, markContentReady, navigateTo, setCurrentPage, hasLoadedOnce } = usePage()
  const suppressHistoryRef = useRef(true)
  const currentPageRef = useRef(currentPage)

  useEffect(() => {
    currentPageRef.current = currentPage
  }, [currentPage])

  const titleMap = useMemo(() => {
    const mapping = new Map<string, string>()
    for (const page of pageEntries) {
      if (page.slug) {
        mapping.set(page.slug, page.title)
      }
    }
    return mapping
  }, [])

  useLayoutEffect(() => {
    const initialPage = pathToPage(window.location.pathname)
    suppressHistoryRef.current = true
    if (initialPage !== currentPageRef.current) {
      setCurrentPage(initialPage)
      currentPageRef.current = initialPage
    }
    const initialPath = pageToPath(initialPage)
    const initialTitle = resolveTitle(initialPage, titleMap)
    document.title = initialTitle
    window.history.replaceState({ page: initialPage }, '', initialPath)
  }, [setCurrentPage, titleMap])

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const statePage =
        typeof event.state?.page === 'string'
          ? event.state.page
          : pathToPage(window.location.pathname)
      if (statePage === currentPageRef.current) {
        suppressHistoryRef.current = true
        return
      }
      suppressHistoryRef.current = true
      navigateTo(statePage)
    }

    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigateTo])

  useEffect(() => {
    const path = pageToPath(currentPage)
    const title = resolveTitle(currentPage, titleMap)
    document.title = title

    if (suppressHistoryRef.current) {
      suppressHistoryRef.current = false
      window.history.replaceState({ page: currentPage }, '', path)
      return
    }

    const currentPath = normalizePath(window.location.pathname)
    if (currentPath !== normalizePath(path)) {
      window.history.pushState({ page: currentPage }, '', path)
    } else {
      window.history.replaceState({ page: currentPage }, '', path)
    }
  }, [currentPage, titleMap, hasLoadedOnce])

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
