import { getMDXComponent } from 'mdx-bundler/client/jsx'
import PhotoSwipeLightbox from 'photoswipe/lightbox'
import { useEffect, useMemo, useRef } from 'react'
import type { ComponentProps, ComponentType, ReactNode } from 'react'
import * as jsxRuntime from 'react/jsx-runtime'

type MarkdownProps = {
  code: string
  className?: string
  components?: Record<string, ComponentType<any>>
}

const baseProseClass =
  'prose prose-invert prose-pre:bg-white/10 prose-pre:text-white prose-headings:font-semibold prose-headings:tracking-tight prose-img:rounded-3xl prose-img:border prose-img:border-white/10 prose-a:text-sky-300 prose-a:no-underline hover:prose-a:text-sky-200'

function mergeClassNames(...classes: Array<string | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function MarkdownImage({ className, loading, alt, src, ...props }: ComponentProps<'img'>) {
  const mergedClassName = mergeClassNames(
    'rounded-3xl border border-white/10 shadow-lg transition hover:border-white/20 hover:shadow-xl',
    className
  )

  if (!src) return null

  const width = (props as { width?: number | string }).width
  const height = (props as { height?: number | string }).height

  return (
    <a
      href={src}
      data-pswp-item
      data-pswp-src={src}
      {...(width ? { 'data-pswp-width': width } : {})}
      {...(height ? { 'data-pswp-height': height } : {})}
      className="block"
    >
      <img
        {...props}
        src={src}
        alt={alt ?? ''}
        className={mergedClassName}
        loading={loading ?? 'lazy'}
        decoding="async"
        draggable={false}
      />
    </a>
  )
}

function Anchor(props: ComponentProps<'a'>) {
  return (
    <a
      {...props}
      className={mergeClassNames(
        'relative font-medium underline decoration-dotted underline-offset-4 transition-colors hover:text-sky-200',
        props.className
      )}
    />
  )
}

const defaultComponents = {
  img: MarkdownImage,
  a: Anchor,
}

export function MarkdownArticle({ code, className, components }: MarkdownProps) {
  const runtime = useMemo(
    () => ({
      Fragment: jsxRuntime.Fragment,
      jsx: jsxRuntime.jsx,
      jsxs: jsxRuntime.jsxs,
      jsxDEV: (jsxRuntime as Record<string, unknown>).jsxDEV,
    }),
    []
  )
  const Component = useMemo(() => getMDXComponent(code, { runtime }), [code, runtime])
  const articleRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const container = articleRef.current
    if (!container) return
    if (!container.querySelector('a[data-pswp-item]')) return

    const lightbox = new PhotoSwipeLightbox({
      gallery: container,
      children: 'a[data-pswp-item]',
      pswpModule: () => import('photoswipe'),
    })

    lightbox.init()

    return () => {
      lightbox.destroy()
    }
  }, [code])

  return (
    <article ref={articleRef} className={mergeClassNames(baseProseClass, 'max-w-none', className)}>
      <Component components={{ ...defaultComponents, ...components }} />
    </article>
  )
}

type PageHeaderProps = {
  title: string
  description?: string | null
  eyebrow?: ReactNode
  className?: string
}

export function PageHeader({ title, description, eyebrow, className }: PageHeaderProps) {
  return (
    <header className={mergeClassNames('space-y-4', className)}>
      {eyebrow}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-base text-white/70 md:text-lg">{description}</p>
        ) : null}
      </div>
    </header>
  )
}
