import React, { useCallback, useEffect, useRef } from 'react'

type VisualizerProps = {
  analyser: AnalyserNode
  visualSetting?: 'waveform' | 'frequencybars'
  color?: string
}

function resolveColor(color: string, element: HTMLElement | null): string {
  if (!color.startsWith('var(') || !element) return color
  const resolved = getComputedStyle(element).getPropertyValue(color.slice(4, -1).trim())
  return resolved.trim() || color
}

export const Visualizer: React.FC<VisualizerProps> = ({
  analyser,
  visualSetting = 'frequencybars',
  color = 'var(--accent-9)',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const smoothedBarsRef = useRef<number[]>([])
  const freqDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const timeDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const colorRef = useRef<string>(color)
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    const displayWidth = Math.max(1, Math.floor(rect.width))
    const displayHeight = Math.max(1, Math.floor(rect.height))
    const pixelWidth = Math.max(1, Math.floor(displayWidth * dpr))
    const pixelHeight = Math.max(1, Math.floor(displayHeight * dpr))

    if (
      sizeRef.current.width === displayWidth &&
      sizeRef.current.height === displayHeight &&
      sizeRef.current.dpr === dpr &&
      canvas.width === pixelWidth &&
      canvas.height === pixelHeight
    ) {
      return
    }

    canvas.width = pixelWidth
    canvas.height = pixelHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    sizeRef.current = {
      width: displayWidth,
      height: displayHeight,
      dpr,
    }
  }, [])

  useEffect(() => {
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.88

    const bufferLength = analyser.frequencyBinCount
    freqDataRef.current = new Uint8Array(bufferLength)
    timeDataRef.current = new Uint8Array(bufferLength)
    smoothedBarsRef.current = new Array(bufferLength).fill(0)
  }, [analyser])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    colorRef.current = resolveColor(color, canvas.closest('.radix-themes') as HTMLElement | null)
  }, [color])

  useEffect(() => {
    resizeCanvas()

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      frameRef.current = requestAnimationFrame(draw)

      const { width: WIDTH, height: HEIGHT } = sizeRef.current
      if (!WIDTH || !HEIGHT) return

      ctx.clearRect(0, 0, WIDTH, HEIGHT)

      const bufferLength = analyser.frequencyBinCount
      const freqData = freqDataRef.current
      const timeData = timeDataRef.current
      if (!freqData || !timeData) return

      if (visualSetting === 'waveform') {
        analyser.getByteTimeDomainData(timeData)

        ctx.lineWidth = 2
        ctx.strokeStyle = colorRef.current
        ctx.beginPath()

        const sliceWidth = WIDTH / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128
          const y = (v * HEIGHT) / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        }

        ctx.lineTo(WIDTH, HEIGHT / 2)
        ctx.stroke()
        return
      }

      analyser.getByteFrequencyData(freqData)

      const gap = 3
      const barCount = bufferLength
      const totalGapWidth = gap * (barCount - 1)
      const barWidth = Math.max((WIDTH - totalGapWidth) / barCount, 1)

      let x = 0
      ctx.fillStyle = colorRef.current

      for (let i = 0; i < barCount; i++) {
        const normalized = freqData[i] / 255
        const target = normalized * HEIGHT
        const current = smoothedBarsRef.current[i]
        const eased = current + (target - current) * 0.16

        smoothedBarsRef.current[i] = eased

        const barHeight = Math.min(Math.max(eased, 2), HEIGHT)
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)

        x += barWidth + gap
      }
    }

    draw()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [analyser, resizeCanvas, visualSetting])

  return <canvas ref={canvasRef} className="h-full w-full" />
}
