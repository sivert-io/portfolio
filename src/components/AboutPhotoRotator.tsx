import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'

type AboutPhotoRotatorProps = {
  images: string[]
  alt?: string
  intervalMs?: number
  className?: string
}

export function AboutPhotoRotator({
  images,
  alt = 'Photos of Sivert Gullberg Hansen',
  intervalMs = 5000,
  className = '',
}: AboutPhotoRotatorProps) {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let cancelled = false

    async function preloadAll() {
      const entries = await Promise.all(
        images.map(
          (src) =>
            new Promise<[string, boolean]>((resolve) => {
              const img = new Image()
              img.src = src

              if (img.complete) {
                resolve([src, true])
                return
              }

              img.onload = () => resolve([src, true])
              img.onerror = () => resolve([src, false])
            })
        )
      )

      if (cancelled) return

      setLoaded(
        entries.reduce<Record<string, boolean>>((acc, [src, ok]) => {
          if (ok) acc[src] = true
          return acc
        }, {})
      )
    }

    if (images.length > 0) {
      preloadAll()
    }

    return () => {
      cancelled = true
    }
  }, [images])

  const readyImages = useMemo(() => images.filter((src) => loaded[src]), [images, loaded])

  useEffect(() => {
    if (readyImages.length <= 1) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % readyImages.length)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [readyImages.length, intervalMs])

  useEffect(() => {
    if (index >= readyImages.length) {
      setIndex(0)
    }
  }, [index, readyImages.length])

  const showSkeleton = images.length > 0 && readyImages.length === 0

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {showSkeleton && (
        <div className="rounded-inherit absolute inset-0 overflow-hidden bg-white/5">
          <div className="absolute inset-0 animate-pulse bg-white/6" />
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}

      {readyImages.length > 0 && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={readyImages[index]}
            src={readyImages[index]}
            alt={alt}
            loading="eager"
            decoding="async"
            draggable={false}
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      )}
    </div>
  )
}
