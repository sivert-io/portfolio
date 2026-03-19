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
  const drawVisualRef = useRef<number>(0)
  const smoothedBarsRef = useRef<number[]>([])

  const resizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
  }, [])

  const visualize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const canvasCtx = canvas.getContext('2d')
    if (!canvasCtx) return

    const effectiveColor = resolveColor(color, canvas.closest('.radix-themes') as HTMLElement)

    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.88

    const draw = () => {
      drawVisualRef.current = requestAnimationFrame(draw)

      resizeCanvas(canvas)

      const WIDTH = canvas.clientWidth
      const HEIGHT = canvas.clientHeight
      const HEIGHT_SCALE = 1.0

      const bufferLength = analyser.frequencyBinCount
      const timeData = new Uint8Array(bufferLength)
      const freqData = new Uint8Array(bufferLength)

      if (smoothedBarsRef.current.length !== bufferLength) {
        smoothedBarsRef.current = new Array(bufferLength).fill(0)
      }

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

      if (visualSetting === 'waveform') {
        analyser.getByteTimeDomainData(timeData)

        canvasCtx.lineWidth = 2
        canvasCtx.strokeStyle = effectiveColor
        canvasCtx.beginPath()

        const sliceWidth = WIDTH / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128
          const y = (v * HEIGHT) / 2

          if (i === 0) {
            canvasCtx.moveTo(x, y)
          } else {
            canvasCtx.lineTo(x, y)
          }

          x += sliceWidth
        }

        canvasCtx.lineTo(WIDTH, HEIGHT / 2)
        canvasCtx.stroke()
        return
      }

      analyser.getByteFrequencyData(freqData)

      const gap = 3
      const barCount = bufferLength
      const totalGapWidth = gap * (barCount - 1)
      const barWidth = Math.max((WIDTH - totalGapWidth) / barCount, 1)

      let x = 0

      for (let i = 0; i < barCount; i++) {
        const normalized = freqData[i] / 255
        const target = normalized * HEIGHT * HEIGHT_SCALE
        const current = smoothedBarsRef.current[i]
        const eased = current + (target - current) * 0.16

        smoothedBarsRef.current[i] = eased

        const barHeight = Math.min(Math.max(eased, 2), HEIGHT)

        canvasCtx.fillStyle = effectiveColor
        canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)

        x += barWidth + gap
      }
    }

    draw()
  }, [analyser, color, resizeCanvas, visualSetting])

  useEffect(() => {
    if (drawVisualRef.current) {
      cancelAnimationFrame(drawVisualRef.current)
    }

    visualize()

    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      resizeCanvas(canvas)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)

      if (drawVisualRef.current) {
        cancelAnimationFrame(drawVisualRef.current)
      }
    }
  }, [resizeCanvas, visualize])

  return <canvas ref={canvasRef} className="h-full w-full" />
}
