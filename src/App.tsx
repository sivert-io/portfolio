import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useNavigate, useParams } from 'react-router-dom'

import { LoadingScreen } from './components'
import { AppRing } from './components/appRing'
import { ProjectContent } from './components/ProjectContent'
import type { AppType } from './packages/signature'
import { apps } from './projects/apps'
import { loadProjectMdx, type ProjectModule } from './lib/projectMdx'
import {
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdFolder,
  MdPerson,
  MdSchool,
} from 'react-icons/md'

const baseApps: AppType[] = [
  {
    description: 'A more personal page about my background, interests, and how I like to work.',
    name: 'About me',
    slug: 'about-me',
    icon: MdPerson,
  },
  {
    name: 'My projects',
    description: 'A collection of projects, experiments, tools, and product work.',
    slug: 'projects',
    icon: MdFolder,
  },
  {
    name: 'My career',
    description: 'A timeline of education, research, work experience, and milestones.',
    slug: 'career',
    icon: MdSchool,
  },
]

const standalonePages = new Set(['about-me', 'career'])
const categoryPages = new Set(['projects'])

const projectContentVariants = {
  initial: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction === 1 ? 96 : -96,
    scale: 0.94,
    filter: 'blur(6px)',
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction === 1 ? -96 : 96,
    scale: 0.94,
    filter: 'blur(6px)',
  }),
}

type BackButtonProps = {
  projectOpen: boolean
  isProjectsRingOpen: boolean
  onCloseProject: () => void
}

function BackButton({ projectOpen, isProjectsRingOpen, onCloseProject }: BackButtonProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (projectOpen) {
      onCloseProject()
      return
    }

    if (isProjectsRingOpen) {
      navigate('/')
      return
    }

    navigate('/')
  }

  const appRingStyle = 'absolute -bottom-[400px]'

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={handleBack}
      className={
        'h-fit w-fit rounded-full border border-white/15 bg-white/5 p-3 text-sm text-nowrap text-white backdrop-blur-sm transition hover:bg-white/10' +
        (!projectOpen && ` ${appRingStyle}`)
      }
    >
      <MdClose size={24} />
    </motion.button>
  )
}

function SideProjectNavButton({
  direction,
  onClick,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? MdChevronLeft : MdChevronRight

  return (
    <button
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/10"
      aria-label={direction === 'prev' ? 'Previous project' : 'Next project'}
      type="button"
    >
      <Icon className="text-3xl" />
    </button>
  )
}

function BottomProjectNavButton({
  direction,
  onClick,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
}) {
  const Icon = direction === 'prev' ? MdChevronLeft : MdChevronRight

  return (
    <button
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md transition hover:bg-white/10"
      aria-label={direction === 'prev' ? 'Previous project' : 'Next project'}
      type="button"
    >
      <Icon className="text-2xl" />
    </button>
  )
}

function App() {
  const navigate = useNavigate()
  const params = useParams<{
    pageSlug?: string
    projectSlug?: string
  }>()

  const pageSlug = params.pageSlug ?? (params.projectSlug ? 'projects' : undefined)
  const projectSlug = params.projectSlug

  const [showStatus, setShowStatus] = useState(false)
  const [hoveredApp, setHoveredApp] = useState<AppType | null>(null)
  const [oldHoveredApp, setOldHoveredApp] = useState<AppType | null>(null)

  const [selectedProjectModule, setSelectedProjectModule] = useState<ProjectModule | null>(null)
  const [openingProjectSlug, setOpeningProjectSlug] = useState<string | null>(null)
  const [projectNavDirection, setProjectNavDirection] = useState<1 | -1>(1)

  const isProjectsRingOpen = pageSlug === 'projects' && !projectSlug
  const isStandalonePage = !!pageSlug && standalonePages.has(pageSlug)
  const isProjectPage = pageSlug === 'projects' && !!projectSlug

  const routeValid = !pageSlug || standalonePages.has(pageSlug) || categoryPages.has(pageSlug)

  const currentRingApps = isProjectsRingOpen ? apps : baseApps

  const selectedProject = useMemo(() => {
    if (isProjectPage && projectSlug) {
      return apps.find((app) => app.slug === projectSlug) ?? null
    }

    if (isStandalonePage && pageSlug) {
      return baseApps.find((app) => app.slug === pageSlug) ?? null
    }

    return null
  }, [isProjectPage, isStandalonePage, pageSlug, projectSlug])

  const projectSiblings = useMemo(() => {
    if (!selectedProject || !isProjectPage) {
      return { previousProject: null, nextProject: null }
    }

    const currentIndex = apps.findIndex((app) => app.slug === selectedProject.slug)
    if (currentIndex === -1) {
      return { previousProject: null, nextProject: null }
    }

    const previousProject = apps[(currentIndex - 1 + apps.length) % apps.length] ?? null
    const nextProject = apps[(currentIndex + 1) % apps.length] ?? null

    return { previousProject, nextProject }
  }, [isProjectPage, selectedProject])

  useEffect(() => {
    if (hoveredApp) {
      setOldHoveredApp(hoveredApp)
    }
  }, [hoveredApp])

  useEffect(() => {
    if (!routeValid) {
      navigate('/', { replace: true })
    }
  }, [navigate, routeValid])

  useEffect(() => {
    let cancelled = false

    async function run() {
      if (!selectedProject) {
        setSelectedProjectModule(null)
        setOpeningProjectSlug(null)
        return
      }

      setOpeningProjectSlug(selectedProject.slug)

      try {
        const mod = await loadProjectMdx(selectedProject.slug)

        if (cancelled) return

        if (!mod) {
          console.error(`No MDX file found for slug: ${selectedProject.slug}`)
          setSelectedProjectModule(null)

          if (isProjectPage) {
            navigate('/projects', { replace: true })
          } else {
            navigate('/', { replace: true })
          }

          return
        }

        setSelectedProjectModule(mod)
      } catch (error) {
        if (cancelled) return

        console.error(`Failed to load MDX for slug: ${selectedProject.slug}`, error)
        setSelectedProjectModule(null)

        if (isProjectPage) {
          navigate('/projects', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      } finally {
        if (!cancelled) {
          setOpeningProjectSlug(null)
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [isProjectPage, navigate, selectedProject])

  useEffect(() => {
    if (isProjectPage && projectSlug) {
      window.scrollTo(0, 0)
    }
  }, [isProjectPage, projectSlug])

  const handleOpenProject = async (app: AppType) => {
    if (openingProjectSlug) return

    if (!pageSlug) {
      if (app.slug === 'projects') {
        navigate('/projects')
        return
      }

      navigate(`/${app.slug}`)
      return
    }

    if (pageSlug === 'projects') {
      setProjectNavDirection(1)
      navigate(`/projects/${app.slug}`)
    }
  }

  const handleCloseProject = () => {
    if (isProjectPage) {
      navigate('/projects')
      return
    }

    navigate('/')
  }

  const handleGoToPreviousProject = () => {
    if (!projectSiblings.previousProject) return
    setProjectNavDirection(-1)
    navigate(`/projects/${projectSiblings.previousProject.slug}`)
  }

  const handleGoToNextProject = () => {
    if (!projectSiblings.nextProject) return
    setProjectNavDirection(1)
    navigate(`/projects/${projectSiblings.nextProject.slug}`)
  }

  const projectOpen = !!selectedProject && !!selectedProjectModule
  const hoveredDisplayApp = oldHoveredApp
  const hoveredAppHasImage = !!hoveredDisplayApp?.image?.trim()
  const selectedProjectHasImage = !!selectedProject?.image?.trim()
  const { previousProject, nextProject } = projectSiblings

  return (
    <main className="fixed inset-0 overflow-auto bg-black">
      <LoadingScreen setShowStatus={setShowStatus} />

      <AnimatePresence mode="wait" initial={false}>
        {!projectOpen ? (
          showStatus && (
            <motion.div
              key={isProjectsRingOpen ? 'ring-projects' : 'ring-root'}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="fixed inset-0 grid place-items-center"
            >
              <AnimatePresence mode="wait">
                <AppRing
                  key={isProjectsRingOpen ? 'projects-ring' : 'base-ring'}
                  introKey={isProjectsRingOpen ? 'projects-ring' : 'base-ring'}
                  isVisible={showStatus && !projectOpen}
                  apps={currentRingApps}
                  radius={256}
                  setHoveredApp={setHoveredApp}
                  hoveredApp={hoveredApp}
                  onAppClick={handleOpenProject}
                  openingProjectSlug={openingProjectSlug}
                  playIntroSpin
                />
              </AnimatePresence>

              <motion.div className="relative z-10 flex h-0 w-0 flex-col items-center justify-center gap-4">
                {isProjectsRingOpen && (
                  <BackButton
                    projectOpen={projectOpen}
                    isProjectsRingOpen={isProjectsRingOpen}
                    onCloseProject={handleCloseProject}
                  />
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredApp ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex w-[360px] flex-col items-center justify-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-center backdrop-blur-2xl"
                >
                  {hoveredDisplayApp && (
                    <>
                      <div className="flex items-center justify-center gap-3">
                        {hoveredAppHasImage ? (
                          <img
                            src={hoveredDisplayApp.image}
                            alt=""
                            aria-hidden="true"
                            className="h-10 w-10 rounded-xl object-contain"
                            draggable={false}
                          />
                        ) : null}

                        <h2 className="text-2xl leading-tight font-bold tracking-tight text-white">
                          {hoveredDisplayApp.name}
                        </h2>
                      </div>

                      <p className="text-base leading-relaxed font-normal tracking-wide text-gray-300/90">
                        {hoveredDisplayApp.description}
                      </p>
                    </>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          )
        ) : (
          <motion.section
            key="project-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-full w-full flex-col items-center gap-4"
          >
            <div className="relative flex w-full max-w-7xl flex-col items-end gap-4 p-4 pt-20 pb-24 md:p-6 md:pt-28 md:pb-10">
              {previousProject ? (
                <div className="absolute top-56 -left-16 hidden -translate-y-1/2 md:block">
                  <SideProjectNavButton direction="prev" onClick={handleGoToPreviousProject} />
                </div>
              ) : null}

              {nextProject ? (
                <div className="absolute top-56 -right-16 hidden -translate-y-1/2 md:block">
                  <SideProjectNavButton direction="next" onClick={handleGoToNextProject} />
                </div>
              ) : null}
              <BackButton
                projectOpen={projectOpen}
                isProjectsRingOpen={isProjectsRingOpen}
                onCloseProject={handleCloseProject}
              />
              <AnimatePresence mode="popLayout" initial={false} custom={projectNavDirection}>
                <motion.div
                  key={selectedProject.slug}
                  custom={projectNavDirection}
                  variants={projectContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col gap-4"
                >
                  {selectedProject && (
                    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                      {selectedProjectHasImage ? (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-1">
                          <img
                            src={selectedProject.image}
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full rounded-xl object-contain"
                            draggable={false}
                          />
                        </div>
                      ) : null}

                      <div className="min-w-0">
                        <h1 className="text-3xl font-bold tracking-tight text-white">
                          {selectedProject.name}
                        </h1>

                        {selectedProject.description ? (
                          <p className="text-sm leading-relaxed text-white/70">
                            {selectedProject.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}

                  <article className="prose prose-invert prose-zinc lg:prose-xl w-full max-w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70 backdrop-blur-sm">
                    <ProjectContent module={selectedProjectModule} />
                  </article>
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-4 md:hidden">
                {previousProject ? (
                  <BottomProjectNavButton direction="prev" onClick={handleGoToPreviousProject} />
                ) : null}

                {nextProject ? (
                  <BottomProjectNavButton direction="next" onClick={handleGoToNextProject} />
                ) : null}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
