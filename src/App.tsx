import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { LoadingScreen } from './components'
import { AppRing } from './components/appRing'
import { ProjectContent } from './components/ProjectContent'
import type { AppType } from './packages/signature'
import { apps } from './projects/apps'
import { loadProjectMdx, type ProjectModule } from './lib/projectMdx'
import { MdArrowBack } from 'react-icons/md'

function App() {
  const [showStatus, setShowStatus] = useState(false)
  const [hoveredApp, setHoveredApp] = useState<AppType | null>(null)
  const [oldHoveredApp, setOldHoveredApp] = useState<AppType | null>(null)

  const [selectedProject, setSelectedProject] = useState<AppType | null>(null)
  const [selectedProjectModule, setSelectedProjectModule] = useState<ProjectModule | null>(null)
  const [openingProjectSlug, setOpeningProjectSlug] = useState<string | null>(null)

  useEffect(() => {
    if (hoveredApp) {
      setOldHoveredApp(hoveredApp)
    }
  }, [hoveredApp])

  const handleOpenProject = async (app: AppType) => {
    if (openingProjectSlug) return

    setOpeningProjectSlug(app.slug)

    try {
      const mod = await loadProjectMdx(app.slug)

      if (!mod) {
        console.error(`No MDX file found for slug: ${app.slug}`)
        return
      }

      setSelectedProjectModule(mod)
      setSelectedProject(app)
    } catch (error) {
      console.error(`Failed to load MDX for slug: ${app.slug}`, error)
    } finally {
      setOpeningProjectSlug(null)
    }
  }

  const handleCloseProject = () => {
    setSelectedProject(null)
    setSelectedProjectModule(null)
  }

  const projectOpen = !!selectedProject && !!selectedProjectModule

  return (
    <main className="fixed inset-0 overflow-hidden bg-black">
      <LoadingScreen setShowStatus={setShowStatus} />

      <AnimatePresence mode="wait">
        {!projectOpen ? (
          <motion.div
            key="wheel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="fixed inset-0 grid place-items-center"
          >
            <AppRing
              show={showStatus}
              apps={apps}
              radius={256}
              setHoveredApp={setHoveredApp}
              hoveredApp={hoveredApp}
              onAppClick={handleOpenProject}
              openingProjectSlug={openingProjectSlug}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="z-10 flex flex-col items-center justify-center gap-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredApp ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
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
          </motion.div>
        ) : (
          <motion.section
            key="project"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="fixed inset-0 z-20 overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-4xl px-6 py-32">
              <button
                onClick={handleCloseProject}
                className="mb-8 flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              >
                <MdArrowBack />
                Go back
              </button>

              <article className="prose prose-invert prose-zinc">
                <ProjectContent module={selectedProjectModule} />
              </article>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
