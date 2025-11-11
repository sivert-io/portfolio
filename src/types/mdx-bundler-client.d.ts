declare module 'mdx-bundler/client/jsx' {
  import type { ComponentType } from 'react'

  export function getMDXComponent(
    code: string,
    jsxRuntime: Record<string, unknown>,
    globals?: Record<string, unknown>,
  ): ComponentType<Record<string, unknown>>
}

