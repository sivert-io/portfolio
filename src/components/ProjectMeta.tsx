import { useEffect, useMemo, useState } from 'react'
import { MdForkRight, MdOpenInNew, MdStar } from 'react-icons/md'

type GitHubStats = {
  stars: number
  forks: number
}

type ProjectMetaProps = {
  repo?: string
  website?: string
}

function Link({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 no-underline transition hover:bg-white/10"
    >
      <MdOpenInNew />
      {label}
    </a>
  )
}

export function ProjectMeta({ repo, website }: ProjectMetaProps) {
  const [stats, setStats] = useState<GitHubStats | null>(null)

  const repoPath = useMemo(() => {
    if (!repo) return null
    const match = repo.match(/github\.com\/([^/]+\/[^/]+)/)
    return match?.[1] ?? null
  }, [repo])

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
    <div className="mb-6 flex flex-wrap gap-3 text-sm text-white/70">
      {repo && <Link href={repo} label="GitHub" />}

      {website && <Link href={website} label="Homepage" />}

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
  )
}
