import { MdMenuBook, MdOpenInNew, MdTrendingUp } from 'react-icons/md'

export type PublicationItem = {
  title: string
  authors: string
  venue: string
  publisher?: string
  year: number
  citations?: number
  pages?: string
  url?: string
  pdfUrl?: string
  description?: string
}

type PublicationListProps = {
  items: PublicationItem[]
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs no-underline transition hover:bg-white/10"
    >
      <MdOpenInNew />
      {label}
    </a>
  )
}

export function PublicationList({ items }: PublicationListProps) {
  return (
    <div className="not-prose flex flex-col gap-4">
      {items.map((item) => (
        <article
          key={`${item.title}-${item.year}`}
          className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-3 text-white/55">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-lg text-white">
                  <MdMenuBook />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
                    {item.year}
                  </span>

                  {typeof item.citations === 'number' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
                      <MdTrendingUp />
                      {item.citations} citations
                    </span>
                  ) : null}
                </div>
              </div>

              <h3 className="text-xl font-semibold tracking-tight text-white">{item.title}</h3>

              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.authors}</p>

              <p className="mt-3 text-sm leading-relaxed text-white/75">
                <span className="font-medium text-white/85">{item.venue}</span>
                {item.pages ? ` · pp. ${item.pages}` : ''}
                {item.publisher ? ` · ${item.publisher}` : ''}
              </p>

              {item.description ? (
                <p className="mt-4 text-sm leading-relaxed text-white/72">{item.description}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {item.url ? <ExternalLink href={item.url} label="Publication" /> : null}
              {item.pdfUrl ? <ExternalLink href={item.pdfUrl} label="PDF" /> : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
