import { useEffect, useRef } from 'react'
import { drawPet, levelToStage } from '../lib/pixelpet'
import type { Species } from '../lib/pixelpet'

interface Props {
  species: Species
  level?: number
  stage?: number
  size?: number
  cssFilter?: string
}

export default function PixelPetCanvas({ species, level = 1, stage, size = 128, cssFilter }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const startRef = useRef(performance.now())
  const resolvedStage = stage ?? levelToStage(level)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pixelScale = Math.max(1, Math.floor(size / 32))
    startRef.current = performance.now()

    function loop() {
      ctx!.clearRect(0, 0, size, size)
      drawPet(ctx!, species, resolvedStage, 0, 0, pixelScale, { time: performance.now() - startRef.current })
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(rafRef.current)
  }, [species, resolvedStage, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        filter: cssFilter,
      }}
    />
  )
}
