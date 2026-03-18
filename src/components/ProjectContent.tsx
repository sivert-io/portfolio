import { MDXProvider } from '@mdx-js/react'
import type { ProjectModule } from '../lib/projectMdx'
import { CareerTimeline } from './CareerTimeline'
import { ProjectMeta } from './ProjectMeta'
import { Video } from './Video'

type ProjectContentProps = {
  module: ProjectModule | null
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold tracking-tight text-white" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold tracking-tight text-white" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold tracking-tight text-white" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="leading-relaxed text-white/80" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="text-white/80" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="text-white/80" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li className="text-white/80" {...props} />,
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="underline underline-offset-4 transition-opacity hover:opacity-80"
      target={props.href?.startsWith('http') ? '_blank' : props.target}
      rel={props.href?.startsWith('http') ? 'noreferrer' : props.rel}
    />
  ),
  ProjectMeta,
  CareerTimeline,
  Video,
}

export function ProjectContent({ module }: ProjectContentProps) {
  if (!module) return null

  const Content = module.default

  return (
    <MDXProvider components={mdxComponents}>
      <Content components={mdxComponents} />
    </MDXProvider>
  )
}
