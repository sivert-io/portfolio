import type { ComponentType } from 'react'
import type { MDXComponents } from 'mdx/types'

export type ProjectModule = {
  default: ComponentType<{ components?: MDXComponents }>
}

const projectModules = import.meta.glob('../projects/*.mdx')

export async function loadProjectMdx(slug: string): Promise<ProjectModule | null> {
  const importer = projectModules[`../projects/${slug}.mdx`]

  if (!importer) {
    return null
  }

  return (await importer()) as ProjectModule
}
