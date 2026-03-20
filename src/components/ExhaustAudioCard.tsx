import { useCallback, useEffect, useRef, useState } from 'react'
import { Visualizer } from './Visualizer'

export function ExhaustAudioCard() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const setupAudio = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return null

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    const audioContext = audioContextRef.current

    if (!sourceRef.current) {
      sourceRef.current = audioContext.createMediaElementSource(audio)
      analyserRef.current = audioContext.createAnalyser()

      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContext.destination)

      setAnalyser(analyserRef.current)
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    return audio
  }, [])

  const togglePlayback = useCallback(async () => {
    const audio = await setupAudio()
    if (!audio) return

    if (audio.paused) {
      await audio.play()
    } else {
      audio.pause()
    }
  }, [setupAudio])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        await togglePlayback()
      }
    },
    [togglePlayback]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={isPlaying ? 'Pause exhaust audio' : 'Play exhaust audio'}
      aria-pressed={isPlaying}
      onClick={togglePlayback}
      onKeyDown={handleKeyDown}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/[0.07] focus:ring-2 focus:ring-white/20 focus:outline-none"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-white">Exhaust sound</div>
          <div className="text-sm text-white/60">Click anywhere to play or pause</div>
        </div>

        <div className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          {isPlaying ? 'Playing' : 'Paused'}
        </div>
      </div>

      <div className="mb-4 flex-1 overflow-hidden rounded-2xl bg-black/10">
        {analyser ? (
          <div className="h-full min-h-24 w-full p-3">
            <Visualizer analyser={analyser} visualSetting="frequencybars" color="#7DA2FF" />
          </div>
        ) : (
          <div className="flex h-full min-h-24 items-center justify-center p-3 text-sm text-white/35">
            Tap to start
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <span>{isPlaying ? 'Click to pause' : 'Click to play'}</span>
        <span>MP3</span>
      </div>

      <audio ref={audioRef} preload="metadata" src="/about-me/exhaust.mp3" className="hidden" />
    </div>
  )
}
