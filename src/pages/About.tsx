import { pages } from 'velite'
import { MarkdownArticle, PageHeader } from '../components/markdown'

const about = pages.find((page) => page.slug === 'about')

export function AboutPage() {
  if (!about) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-20 pb-24 text-center text-white/60">
        <p>About content will be published soon.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 pt-24 pb-24">
      <PageHeader title={about.title} description={about.description} />
      <MarkdownArticle code={about.body} />
    </div>
  )
}
