"use client"

import { useEffect, useRef } from "react"

interface TimelineEvent {
  id: string
  date: Date
  title: string
  description?: string
  type: "case" | "search" | "alert" | "update"
}

interface TimelineChartProps {
  events: TimelineEvent[]
  height?: number
}

export function TimelineChart({ events, height = 200 }: TimelineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Event colors by type
  const eventColors = {
    case: "#3b82f6", // blue
    search: "#10b981", // green
    alert: "#ef4444", // red
    update: "#8b5cf6", // purple
  }

  useEffect(() => {
    if (!canvasRef.current || events.length === 0) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = height

    // Sort events by date
    const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Find date range
    const startDate = sortedEvents[0].date.getTime()
    const endDate = sortedEvents[sortedEvents.length - 1].date.getTime()
    const dateRange = endDate - startDate || 1 // Avoid division by zero

    // Padding
    const padding = { left: 50, right: 50, top: 30, bottom: 30 }
    const innerWidth = canvas.width - padding.left - padding.right
    const innerHeight = canvas.height - padding.top - padding.bottom

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw timeline axis
    ctx.beginPath()
    ctx.moveTo(padding.left, canvas.height - padding.bottom)
    ctx.lineTo(canvas.width - padding.right, canvas.height - padding.bottom)
    ctx.strokeStyle = "rgba(150, 150, 150, 0.5)"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw events
    sortedEvents.forEach((event, index) => {
      // Calculate x position based on date
      const x = padding.left + (innerWidth * (event.date.getTime() - startDate)) / dateRange

      // Draw event marker
      ctx.beginPath()
      ctx.arc(x, canvas.height - padding.bottom, 6, 0, 2 * Math.PI)
      ctx.fillStyle = eventColors[event.type] || "#888888"
      ctx.fill()
      ctx.strokeStyle = "white"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw vertical line
      ctx.beginPath()
      ctx.moveTo(x, canvas.height - padding.bottom)
      ctx.lineTo(x, padding.top + (index % 2) * 40) // Alternate heights for labels
      ctx.strokeStyle = "rgba(150, 150, 150, 0.2)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw date label
      ctx.font = "10px sans-serif"
      ctx.fillStyle = "rgba(100, 100, 100, 0.8)"
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(event.date.toLocaleDateString(), x, canvas.height - padding.bottom + 15)

      // Draw event title
      ctx.font = "12px sans-serif"
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
      ctx.textAlign = "center"
      ctx.textBaseline = "bottom"
      ctx.fillText(
        event.title.length > 20 ? event.title.substring(0, 20) + "..." : event.title,
        x,
        padding.top + (index % 2) * 40 - 5,
      )
    })

    // Draw time period labels
    const numLabels = 5
    for (let i = 0; i <= numLabels; i++) {
      const x = padding.left + (innerWidth * i) / numLabels
      const date = new Date(startDate + (dateRange * i) / numLabels)

      // Draw tick mark
      ctx.beginPath()
      ctx.moveTo(x, canvas.height - padding.bottom)
      ctx.lineTo(x, canvas.height - padding.bottom + 5)
      ctx.strokeStyle = "rgba(150, 150, 150, 0.5)"
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }, [events, height])

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}

