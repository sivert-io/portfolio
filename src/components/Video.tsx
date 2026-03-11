type VideoProps = {
  src: string
  poster?: string
}

export function Video({ src, poster }: VideoProps) {
  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <video controls playsInline poster={poster} className="w-full">
        <source src={src} />
      </video>
    </div>
  )
}
