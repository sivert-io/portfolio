import { AnimatePresence, motion } from 'motion/react'
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

  useEffect(() => {
    if (images.length <= 1) return

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, intervalMs)

    return () => {
      window.clearInterval(id)
    }
  }, [images.length, intervalMs])

  if (images.length === 0) return null

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt={alt}
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>
    </div>
  )
}
