import { getMDXComponent } from 'mdx-bundler/client/jsx'
import { createPortal } from 'react-dom'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type ComponentType,
  type ReactNode,
  type SVGProps,
} from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import type { IconType } from 'react-icons'

type IconModule = Record<string, unknown>

const ICON_PREFIX_LOADERS: Record<string, () => Promise<IconModule>> = {
  fa6: () => import('react-icons/fa6'),
  vsc: () => import('react-icons/vsc'),
  tfi: () => import('react-icons/tfi'),
  io5: () => import('react-icons/io5'),
  hi2: () => import('react-icons/hi2'),
  ai: () => import('react-icons/ai'),
  bi: () => import('react-icons/bi'),
  bs: () => import('react-icons/bs'),
  cg: () => import('react-icons/cg'),
  ci: () => import('react-icons/ci'),
  di: () => import('react-icons/di'),
  fa: () => import('react-icons/fa'),
  fi: () => import('react-icons/fi'),
  gi: () => import('react-icons/gi'),
  go: () => import('react-icons/go'),
  gr: () => import('react-icons/gr'),
  hi: () => import('react-icons/hi'),
  im: () => import('react-icons/im'),
  io: () => import('react-icons/io'),
  lu: () => import('react-icons/lu'),
  md: () => import('react-icons/md'),
  pi: () => import('react-icons/pi'),
  ri: () => import('react-icons/ri'),
  rx: () => import('react-icons/rx'),
  si: () => import('react-icons/si'),
  sl: () => import('react-icons/sl'),
  tb: () => import('react-icons/tb'),
  ti: () => import('react-icons/ti'),
  wi: () => import('react-icons/wi'),
}

const ICON_PREFIXES = Object.keys(ICON_PREFIX_LOADERS).sort((a, b) => b.length - a.length)
const ICON_CACHE = new Map<string, IconType>()
const ICON_MODULE_CACHE = new Map<string, Promise<IconModule>>()

type LightboxImage = {
  src: string
  alt?: string
}

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

function resolveIconPrefix(name: string) {
  const lower = name.toLowerCase()
  return ICON_PREFIXES.find((prefix) => lower.startsWith(prefix)) ?? null
}

function Icon({
  name,
  size = 20,
  className,
  ...props
}: { name: string; size?: number | string } & SVGProps<SVGSVGElement>) {
  const [icon, setIcon] = useState<IconType | null>(() => {
    return ICON_CACHE.get(name) ?? null
  })

  useEffect(() => {
    if (!name) return
    const cached = ICON_CACHE.get(name)
    if (cached) {
      setIcon(() => cached)
      return
    }

    setIcon(null)

    const prefix = resolveIconPrefix(name)
    if (!prefix) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Icon] No loader configured for icon "${name}"`)
      }
      return
    }

    const loader = ICON_PREFIX_LOADERS[prefix]
    if (!loader) return

    const loadModule = ICON_MODULE_CACHE.get(prefix) ?? loader()
    ICON_MODULE_CACHE.set(prefix, loadModule)

    let cancelled = false
    loadModule
      .then((module) => {
        if (cancelled) return
        const candidate = module[name as keyof IconModule]
        if (typeof candidate !== 'function') {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[Icon] Unable to locate export "${name}" in react-icons/${prefix}`)
          }
          return
        }
        const Loaded = candidate as IconType
        ICON_CACHE.set(name, Loaded)
        setIcon(() => Loaded)
      })
      .catch(() => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[Icon] Failed to load icon module for prefix "${prefix}"`)
        }
      })

    return () => {
      cancelled = true
    }
  }, [name])

  if (!icon) return null

  const Component = icon
  return (
    <Component
      className={mergeClassNames('inline-block align-middle', className)}
      size={size}
      {...props}
    />
  )
}

function MarkdownImage({
  className,
  loading,
  alt,
  src,
  onOpen,
  registerImage,
  ...props
}: ComponentProps<'img'> & {
  registerImage: (image: LightboxImage) => void
  onOpen: (src: string) => void
}) {
  const mergedClassName = mergeClassNames(
    'rounded-3xl border border-white/10 shadow-lg transition hover:border-white/20 hover:shadow-xl',
    className
  )

  if (!src) return null

  registerImage({ src, alt: alt ?? '' })

  return (
    <button
      type="button"
      onClick={() => onOpen(src)}
      className="group block cursor-zoom-in overflow-hidden rounded-3xl border border-transparent p-0 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
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
    </button>
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

const defaultComponents = (
  registerImage: (image: LightboxImage) => void,
  openImage: (src: string) => void
) => ({
  img: (props: ComponentProps<'img'>) => (
    <MarkdownImage {...props} registerImage={registerImage} onOpen={openImage} />
  ),
  a: Anchor,
  Icon,
})

type LightboxOverlayProps = {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onNavigate: (direction: -1 | 1) => void
}

function LightboxOverlay({ images, index, onClose, onNavigate }: LightboxOverlayProps) {
  if (index < 0 || index >= images.length) return null
  const image = images[index]

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowRight') {
        onNavigate(1)
      } else if (event.key === 'ArrowLeft') {
        onNavigate(-1)
      }
    }
    window.addEventListener('keydown', handleKey)

    const { style } = document.body
    const previousOverflow = style.overflow
    style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKey)
      style.overflow = previousOverflow
    }
  }, [onClose, onNavigate])

  return createPortal(
    <div
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/90 p-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full max-w-5xl items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        {images.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => onNavigate(-1)}
              className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-2xl text-white transition hover:bg-white/20 focus:ring-2 focus:ring-white/60 focus:outline-none"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => onNavigate(1)}
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-2xl text-white transition hover:bg-white/20 focus:ring-2 focus:ring-white/60 focus:outline-none"
            >
              ›
            </button>
          </>
        ) : null}

        <img
          src={image.src}
          alt={image.alt ?? ''}
          className="max-h-[80vh] w-auto max-w-full rounded-3xl border border-white/20 shadow-2xl"
          loading="lazy"
        />

        <button
          type="button"
          aria-label="Close image preview"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm tracking-[0.2em] text-white uppercase transition hover:bg-white/20 focus:ring-2 focus:ring-white/60 focus:outline-none"
        >
          Close
        </button>

        {image.alt ? (
          <p className="absolute bottom-6 left-1/2 max-w-lg -translate-x-1/2 text-center text-sm text-white/70">
            {image.alt}
          </p>
        ) : null}
      </div>
    </div>,
    document.body
  )
}

export function MarkdownArticle({ code, className, components }: MarkdownProps) {
  const [images, setImages] = useState<LightboxImage[]>([])
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  useEffect(() => {
    setImages([])
    setActiveIndex(null)
  }, [code])

  const registerImage = useMemo(
    () => (image: LightboxImage) => {
      setImages((prev) => {
        if (prev.some((item) => item.src === image.src)) return prev
        return [...prev, image]
      })
    },
    []
  )

  const openImage = useCallback(
    (src: string) => {
      const index = images.findIndex((image) => image.src === src)
      if (index !== -1) {
        setActiveIndex(index)
      }
    },
    [images]
  )

  const closeLightbox = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const navigateLightbox = useCallback(
    (direction: -1 | 1) => {
      setActiveIndex((current) => {
        if (current === null || images.length === 0) return current
        const nextIndex = (current + direction + images.length) % images.length
        return nextIndex
      })
    },
    [images.length]
  )

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

  return (
    <article className={mergeClassNames(baseProseClass, 'max-w-none', className)}>
      <Component components={{ ...defaultComponents(registerImage, openImage), ...components }} />

      {activeIndex !== null ? (
        <LightboxOverlay
          images={images}
          index={activeIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      ) : null}
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
