import { pages, projects } from 'velite'
import { MarkdownArticle, PageHeader } from '../components/markdown'

const projectsCopy = pages.find((page) => page.slug === 'projects')

type ProjectEntry = (typeof projects)[number]

function sortProjects(items: ProjectEntry[]) {
  return [...items].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return bTime - aTime
  })
}

export function ProjectsPage() {
  const orderedProjects = sortProjects(projects)

  return (
    <div className="mx-auto max-w-4xl space-y-16 px-6 pt-24 pb-28">
      {projectsCopy ? (
        <div className="space-y-10">
          <PageHeader title={projectsCopy.title} description={projectsCopy.description} />
          <MarkdownArticle code={projectsCopy.body} />
        </div>
      ) : (
        <PageHeader
          title="Projects"
          description="Notes on prototypes and shipped collaborations."
        />
      )}

      <div className="space-y-16">
        {orderedProjects.map((project) => (
          <section
            key={project._id}
            className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8"
          >
            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs tracking-[0.3em] text-white/40 uppercase">
                <span>
                  {project.publishedAt
                    ? new Date(project.publishedAt).toLocaleDateString()
                    : 'In progress'}
                </span>
                {project.tags?.length ? (
                  <>
                    <span className="h-px w-8 bg-white/10" />
                    <span>{project.tags.join(' · ')}</span>
                  </>
                ) : null}
              </div>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">{project.title}</h2>
              <p className="text-sm text-white/70 md:text-base">{project.summary}</p>
            </header>

            <MarkdownArticle code={project.body} />
          </section>
        ))}
      </div>
    </div>
  )
}
