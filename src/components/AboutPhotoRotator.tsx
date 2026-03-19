import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

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

    setLoaded({})
    setIndex(0)

    for (const src of images) {
      const img = new Image()
      img.decoding = 'async'
      img.loading = 'eager'
      img.src = src

      const markLoaded = async () => {
        try {
          if ('decode' in img) {
            await img.decode().catch(() => {})
          }
        } catch {
          // ignore decode errors
        }

        if (cancelled) return

        setLoaded((current) => {
          if (current[src]) return current
          return { ...current, [src]: true }
        })
      }

      if (img.complete) {
        void markLoaded()
      } else {
        img.onload = () => {
          void markLoaded()
        }
        img.onerror = () => {
          // ignore broken images so they do not block the rotator
        }
      }
    }

    return () => {
      cancelled = true
    }
  }, [images])

  useEffect(() => {
    const readyImages = images.filter((src) => loaded[src])

    if (readyImages.length <= 1) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % readyImages.length)
    }, intervalMs)

    return () => window.clearInterval(id)
  }, [images, loaded, intervalMs])

  const readyImages = images.filter((src) => loaded[src])
  const showSkeleton = images.length > 0 && readyImages.length === 0

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {showSkeleton && (
        <div className="absolute inset-0 overflow-hidden bg-white/5">
          <div className="absolute inset-0 animate-pulse bg-white/6" />
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}

      {readyImages.map((src, i) => {
        const isActive = i === index % readyImages.length

        return (
          <motion.img
            key={src}
            src={src}
            alt={alt}
            draggable={false}
            loading="eager"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 1.025,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              pointerEvents: 'none',
            }}
          />
        )
      })}
    </div>
  )
}
