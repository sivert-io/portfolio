import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import {
  MdBusiness,
  MdClose,
  MdEmojiEvents,
  MdMenuBook,
  MdSchool,
  MdStar,
  MdVolunteerActivism,
  MdWork,
} from 'react-icons/md'

export type CareerTimelineFilter = 'all' | 'work' | 'education' | 'research' | 'freelance'

export type CareerTimelineItem = {
  year: string
  title: string
  subtitle?: string
  description?: string
  badge?: string
  duration?: string
  logo?: string
  icon?: 'education' | 'work' | 'award' | 'company' | 'volunteering' | 'publication' | 'star'
  categories: CareerTimelineFilter[]
  tooltip?: {
    title?: string
    body: string
    footer?: string
  }
}

type CareerTimelineProps = {
  items: CareerTimelineItem[]
}

type HoverState = {
  item: CareerTimelineItem
  x: number
  y: number
} | null

const filterOptions: Array<{ key: CareerTimelineFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'work', label: 'Work experience' },
  { key: 'education', label: 'Education' },
  { key: 'research', label: 'Research' },
  { key: 'freelance', label: 'Freelance / side projects' },
]

function getIcon(icon?: CareerTimelineItem['icon']) {
  switch (icon) {
    case 'education':
      return <MdSchool />
    case 'work':
      return <MdWork />
    case 'award':
      return <MdEmojiEvents />
    case 'company':
      return <MdBusiness />
    case 'volunteering':
      return <MdVolunteerActivism />
    case 'publication':
      return <MdMenuBook />
    case 'star':
      return <MdStar />
    default:
      return <MdWork />
  }
}

function groupByYear(items: CareerTimelineItem[]) {
  const groups = new Map<string, CareerTimelineItem[]>()

  for (const item of items) {
    const existing = groups.get(item.year) ?? []
    existing.push(item)
    groups.set(item.year, existing)
  }

  return Array.from(groups.entries()).map(([year, entries]) => ({
    year,
    entries,
  }))
}

export function CareerTimeline({ items }: CareerTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<CareerTimelineFilter>('all')
  const [hovered, setHovered] = useState<HoverState>(null)
  const [selectedItem, setSelectedItem] = useState<CareerTimelineItem | null>(null)

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items
    return items.filter((item) => item.categories.includes(activeFilter))
  }, [activeFilter, items])

  const groupedItems = useMemo(() => groupByYear(filteredItems), [filteredItems])

  return (
    <div className="not-prose relative py-6">
      <div className="mb-10 flex flex-wrap gap-3">
        {filterOptions.map((filter) => {
          const isActive = activeFilter === filter.key

          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => {
                setActiveFilter(filter.key)
                setHovered(null)
                setSelectedItem(null)
              }}
              className={
                'rounded-full border px-4 py-2 text-sm transition ' +
                (isActive
                  ? 'border-white/20 bg-white/12 text-white'
                  : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/8 hover:text-white')
              }
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      {groupedItems.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/65">
          No timeline entries in this filter yet.
        </div>
      ) : (
        <div className="grid gap-10">
          {groupedItems.map((group) => (
            <section key={group.year} className="grid gap-6 md:grid-cols-[96px_1fr]">
              <div className="pt-2 text-sm font-semibold tracking-[0.18em] text-white/35 uppercase">
                {group.year}
              </div>

              <div className="relative pl-8">
                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10" />

                <div className="flex flex-col gap-8">
                  {group.entries.map((item, index) => (
                    <div key={`${group.year}-${item.title}-${index}`} className="relative">
                      <div className="absolute top-4 -left-8 h-px w-8 bg-white/10" />

                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4">
                          <button
                            type="button"
                            onMouseEnter={(event) => {
                              setHovered({
                                item,
                                x: event.clientX,
                                y: event.clientY,
                              })
                            }}
                            onMouseMove={(event) => {
                              setHovered({
                                item,
                                x: event.clientX,
                                y: event.clientY,
                              })
                            }}
                            onMouseLeave={() => {
                              setHovered((current) =>
                                current?.item.title === item.title ? null : current
                              )
                            }}
                            onClick={() => setSelectedItem(item)}
                            className="group relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-xl text-white transition hover:border-white/20 hover:bg-white/12"
                            aria-label={item.title}
                          >
                            {item.logo ? (
                              <img
                                src={item.logo}
                                alt=""
                                aria-hidden="true"
                                className="h-8 w-8 object-contain"
                                draggable={false}
                              />
                            ) : (
                              <span className="text-[22px]">{getIcon(item.icon)}</span>
                            )}
                          </button>

                          <div className="min-w-0 pt-1">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="cursor-pointer text-left"
                            >
                              <h3 className="m-0 text-lg font-semibold tracking-tight text-white transition hover:text-white/85">
                                {item.title}
                              </h3>
                            </button>

                            {item.subtitle ? (
                              <p className="mt-1 text-sm text-white/55">{item.subtitle}</p>
                            ) : null}

                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.duration ? (
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
                                  {item.duration}
                                </span>
                              ) : null}

                              {item.badge ? (
                                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>

                            {item.description ? (
                              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      <AnimatePresence>
        {hovered ? (
          <motion.div
            key={`hover-${hovered.item.title}`}
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            className="pointer-events-none fixed z-[100] w-[280px] rounded-2xl border border-white/10 bg-black/85 p-4 shadow-2xl backdrop-blur-xl"
            style={{
              left: hovered.x + 18,
              top: hovered.y + 18,
            }}
          >
            <div className="text-sm font-semibold text-white">
              {hovered.item.tooltip?.title ?? hovered.item.title}
            </div>

            {hovered.item.subtitle ? (
              <p className="mt-1 text-xs text-white/55">{hovered.item.subtitle}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {hovered.item.duration ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/60">
                  {hovered.item.duration}
                </span>
              ) : null}

              {hovered.item.badge ? (
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/60">
                  {hovered.item.badge}
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-white/72">
              {hovered.item.tooltip?.body ?? hovered.item.description ?? ''}
            </p>

            {hovered.item.tooltip?.footer ? (
              <p className="mt-3 text-xs leading-relaxed text-white/40">
                {hovered.item.tooltip.footer}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selectedItem ? (
          <>
            <motion.button
              type="button"
              aria-label="Close details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-x-4 top-1/2 z-[120] mx-auto w-full max-w-2xl -translate-y-1/2 rounded-3xl border border-white/10 bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-white">
                    {selectedItem.logo ? (
                      <img
                        src={selectedItem.logo}
                        alt=""
                        aria-hidden="true"
                        className="h-9 w-9 object-contain opacity-95"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-2xl">{getIcon(selectedItem.icon)}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                      {selectedItem.title}
                    </h3>

                    {selectedItem.subtitle ? (
                      <p className="mt-1 text-sm text-white/58">{selectedItem.subtitle}</p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
                        {selectedItem.year}
                      </span>

                      {selectedItem.duration ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
                          {selectedItem.duration}
                        </span>
                      ) : null}

                      {selectedItem.badge ? (
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/65">
                          {selectedItem.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                >
                  <MdClose />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {selectedItem.description ? (
                  <p className="text-sm leading-relaxed text-white/76">
                    {selectedItem.description}
                  </p>
                ) : null}

                {selectedItem.tooltip?.body ? (
                  <p className="text-sm leading-relaxed text-white/72">
                    {selectedItem.tooltip.body}
                  </p>
                ) : null}

                {selectedItem.tooltip?.footer ? (
                  <p className="text-xs leading-relaxed tracking-wide text-white/42">
                    {selectedItem.tooltip.footer}
                  </p>
                ) : null}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
