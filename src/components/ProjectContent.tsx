import { MDXProvider } from '@mdx-js/react'
import type { ProjectModule } from '../lib/projectMdx'
import { ProjectMeta } from './ProjectMeta'
import { Video } from './Video'

type ProjectContentProps = {
  module: ProjectModule | null
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold tracking-tight" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold tracking-tight" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      className="underline underline-offset-4 transition-opacity hover:opacity-80"
      target={props.href?.startsWith('http') ? '_blank' : props.target}
      rel={props.href?.startsWith('http') ? 'noreferrer' : props.rel}
    />
  ),
  ProjectMeta,
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
