import { pages, projects } from 'velite'
import { MarkdownArticle, PageHeader } from '../components/markdown'

const workCopy = pages.find((page) => page.slug === 'work')

type ProjectEntry = (typeof projects)[number]

function sortProjects(items: ProjectEntry[]) {
  return [...items].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
    return bTime - aTime
  })
}

export function WorkPage() {
  const highlightedProjects = sortProjects(projects).slice(0, 3)

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-6 pb-24 pt-24">
      {workCopy ? (
        <div className="space-y-12">
          <PageHeader title={workCopy.title} description={workCopy.description} />
          <MarkdownArticle code={workCopy.body} />
        </div>
      ) : (
        <PageHeader
          title="Work"
          description="Selected projects and launch stories are on the way."
        />
      )}

      <section className="space-y-8">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Recent highlights
          </h2>
          <p className="mt-2 text-sm text-white/60 md:text-base">
            A snapshot of the case studies I walk through with new collaborators.
          </p>
        </header>

        <div className="grid gap-10 md:grid-cols-2">
          {highlightedProjects.map((project) => (
            <article
              key={project._id}
              className="group flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-white/20 hover:bg-white/10"
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                  {project.publishedAt
                    ? new Date(project.publishedAt).toLocaleDateString()
                    : 'In progress'}
                </p>
                <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                <p className="text-sm text-white/70">{project.summary}</p>
              </div>
              {project.coverImage ? (
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="h-48 w-full rounded-3xl border border-white/10 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
