import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'

import remarkGfm from 'remark-gfm'
import remarkToc from 'remark-toc'
import remarkFlexibleCodeTitles from 'remark-flexible-code-titles'

import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeExternalLinks from 'rehype-external-links'

import { transformerCopyButton } from '@rehype-pretty/transformers'

export default defineConfig({
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkToc, remarkFlexibleCodeTitles],
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeExternalLinks,
            {
              target: '_blank',
              rel: ['noopener', 'noreferrer'],
            },
          ],
          [
            rehypePrettyCode,
            {
              theme: 'github-dark',
              transformers: [
                transformerCopyButton({
                  visibility: 'hover',
                }),
              ],
            },
          ],
        ],
      }),
    },

    react({
      include: /\.(mdx|md|js|jsx|ts|tsx)$/,
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),

    tailwindcss(),
  ],
})
