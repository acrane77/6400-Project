'use client'

import { useEffect, useRef } from 'react'

interface Display {
  matrix: number[][]
  border?: number
}

export default function MatrixDisplay({ matrix, border = 1 }: Display) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || !matrix?.length) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw() {
      const rows = matrix.length
      const cols = matrix[0].length
      const totalRows = rows + border * 2
      const totalCols = cols + border * 2

      const dpr = window.devicePixelRatio || 1
      const availW = container!.clientWidth * dpr
      const availH = container!.clientHeight * dpr

      const cell = Math.max(
        1,
        Math.floor(Math.min(availW / totalCols, availH / totalRows))
      )

      canvas!.width = totalCols * cell
      canvas!.height = totalRows * cell
      canvas!.style.width = `${(totalCols * cell) / dpr}px`
      canvas!.style.height = `${(totalRows * cell) / dpr}px`

      ctx!.fillStyle = 'white'
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height)

      ctx!.fillStyle = 'black'
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (matrix[r][c] !== 0) {
            ctx!.fillRect((c + border) * cell, (r + border) * cell, cell, cell)
          }
        }
      }
    }

    draw()

    const observer = new ResizeObserver(draw)
    observer.observe(container)
    return () => observer.disconnect()
  }, [matrix, border])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'white',
      }}
    >
      <canvas ref={canvasRef} style={{ imageRendering: 'pixelated' }} />
    </div>
  )
}