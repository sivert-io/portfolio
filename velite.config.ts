import { defineCollection, defineConfig, s } from 'velite'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

const normalizePath = (input: string) => input.replace(/\\/g, '/').replace(/^\/+/, '')
const trimPrefix = (path: string, prefix: string) =>
  path.startsWith(prefix) ? path.slice(prefix.length) : path

const pages = defineCollection({
  name: 'pages',
  pattern: 'pages/**/*.mdx',
  schema: s
    .object({
      title: s.string(),
      description: s.string().optional(),
      heroImage: s.string().optional(),
      body: s.mdx(),
    })
    .transform((data, { meta }) => {
      const absolute = normalizePath(String(meta.path ?? ''))
      const relative = absolute.includes('/content/') ? absolute.split('/content/')[1]! : absolute
      const slug = trimPrefix(relative.replace(/\.mdx?$/, ''), 'pages/')

      return {
        ...data,
        slug,
        url: slug === '' || slug === 'index' ? '/' : `/${slug}`,
        _id: slug || 'index',
        body: typeof data.body === 'string' ? data.body : '',
      }
    }),
})

const projects = defineCollection({
  name: 'projects',
  pattern: 'projects/**/*.mdx',
  schema: s
    .object({
      title: s.string(),
      summary: s.string(),
      publishedAt: s.string().optional(),
      coverImage: s.string().optional(),
      tags: s.array(s.string()).optional(),
      body: s.mdx(),
    })
    .transform((data, { meta }) => {
      const absolute = normalizePath(String(meta.path ?? ''))
      const relative = absolute.includes('/content/') ? absolute.split('/content/')[1]! : absolute
      const slug = trimPrefix(relative.replace(/\.mdx?$/, ''), 'projects/')

      return {
        ...data,
        slug,
        url: `/projects/${slug}`,
        _id: slug,
        body: typeof data.body === 'string' ? data.body : '',
      }
    }),
})

export default defineConfig({
  root: './content',
  collections: {
    pages,
    projects,
  },
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
          properties: {
            className: ['anchor-link'],
          },
        },
      ],
    ],
  },
})

