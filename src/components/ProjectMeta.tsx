import { useEffect, useMemo, useState } from 'react'
import type { IconType } from 'react-icons/lib'
import { MdForkRight, MdHomeFilled, MdOpenInNew, MdStar } from 'react-icons/md'

type GitHubStats = {
  stars: number
  forks: number
}

type ProjectMetaProps = {
  title: string
  slug: string
  repo?: string
  website?: string
}

function Link({ label, href, Icon }: { label: string; href: string; Icon?: IconType }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 no-underline transition hover:bg-white/10"
    >
      {Icon ? <Icon /> : <MdOpenInNew />}
      {label}
    </a>
  )
}

export function ProjectMeta({ meta }: { meta: ProjectMetaProps }) {
  const [stats, setStats] = useState<GitHubStats | null>(null)

  const repoPath = useMemo(() => {
    if (!meta?.repo) return null
    const match = meta.repo.match(/github\.com\/([^/]+\/[^/]+)/)
    return match?.[1] ?? null
  }, [meta.repo])

  useEffect(() => {
    if (!repoPath) return

    fetch(`https://api.github.com/repos/${repoPath}`)
      .then((res) => res.json())
      .then((data) => {
        setStats({
          stars: data.stargazers_count ?? 0,
          forks: data.forks_count ?? 0,
        })
      })
      .catch((error) => {
        console.error('Failed to load GitHub stats:', error)
      })
  }, [repoPath])

  return (
    <div className="flex w-full flex-col gap-4">
      <img
        src={`/${meta.slug}/preview.webp`}
        className="m-0! h-auto w-full overflow-hidden rounded-2xl object-cover p-0!"
      />
      <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-2 text-sm text-white/70">
        {meta.website && <Link href={meta.website} label="Homepage" Icon={MdHomeFilled} />}
        {meta.repo && <Link href={meta.repo} label="GitHub" />}
        {stats && (
          <>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <MdStar /> {stats.stars}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <MdForkRight /> {stats.forks}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
