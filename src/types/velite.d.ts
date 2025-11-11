declare module 'velite' {
  export type PageEntry = {
    _id: string
    title: string
    description?: string | null
    heroImage?: string | null
    slug: string
    url: string
  body: string
  }

  export type ProjectEntry = {
    _id: string
    title: string
    summary: string
    publishedAt?: string | null
    coverImage?: string | null
    tags?: string[] | null
    slug: string
    url: string
  body: string
  }

  export const pages: PageEntry[]
  export const projects: ProjectEntry[]
}

