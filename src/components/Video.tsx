type VideoProps = {
  src: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
}

export function Video({
  src,
  poster,
  className,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
}: VideoProps) {
  return (
    <video
      src={src}
      poster={poster}
      playsInline
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      controls={controls}
      className={`h-full w-full rounded-xl ${className ?? ''}`}
    />
  )
}
