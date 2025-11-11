import { AnimatePresence, motion } from 'motion/react'
import { LoadingScreen, Navbar } from './components'
import { usePage } from './hooks'
import { HomePage, AboutPage, ContactPage } from './pages'

function App() {
  const { currentPage, isLoading } = usePage()

  return (
    <AnimatePresence mode="wait">
      {isLoading && <LoadingScreen key="loading-screen" />}
      {!isLoading && <Navbar key="navbar" />}
      {!isLoading && (
        <motion.div key={currentPage}>
          {currentPage === 'home' && <HomePage key="home-page" />}
          {currentPage === 'about' && <AboutPage key="about-page" />}
          {currentPage === 'contact' && <ContactPage key="contact-page" />}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
