"use client"

import { useEffect, useRef } from "react"

interface ActivityData {
  date: string
  count: number
}

interface ActivityHeatmapProps {
  data: ActivityData[]
  startDate: Date
  endDate: Date
}

export function ActivityHeatmap({ data, startDate, endDate }: ActivityHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Calculate date range
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeks = Math.ceil(daysDiff / 7)

    // Find max count for color scaling
    const maxCount = Math.max(...data.map((d) => d.count), 1)

    // Cell dimensions
    const cellSize = 14
    const cellPadding = 2
    const totalCellSize = cellSize + cellPadding

    // Convert data to map for easy lookup
    const activityMap = new Map<string, number>()
    data.forEach((d) => {
      activityMap.set(d.date, d.count)
    })

    // Draw heatmap
    const startDay = startDate.getDay()

    for (let week = 0; week < weeks; week++) {
      for (let day = 0; day < 7; day++) {
        const dayOffset = week * 7 + day - startDay
        if (dayOffset < 0 || dayOffset > daysDiff) continue

        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + dayOffset)

        const dateString = currentDate.toISOString().split("T")[0]
        const count = activityMap.get(dateString) || 0

        // Calculate color intensity
        const intensity = count / maxCount

        // Calculate position
        const x = week * totalCellSize
        const y = day * totalCellSize

        // Draw cell
        ctx.fillStyle = getHeatColor(intensity)
        ctx.fillRect(x, y, cellSize, cellSize)

        // Draw date tooltip on hover (would need event listeners in a real implementation)
      }
    }

    // Draw day labels
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
    ctx.font = "10px sans-serif"
    ctx.textAlign = "left"

    for (let day = 0; day < 7; day++) {
      ctx.fillText(days[day], weeks * totalCellSize + 4, day * totalCellSize + 10)
    }

    // Draw month labels
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    ctx.textAlign = "center"

    let currentMonth = -1
    let monthStartWeek = 0

    for (let week = 0; week < weeks; week++) {
      const dayOffset = week * 7 - startDay
      if (dayOffset < 0) continue

      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + dayOffset)

      const month = currentDate.getMonth()

      if (month !== currentMonth) {
        currentMonth = month
        monthStartWeek = week

        ctx.fillText(months[month], monthStartWeek * totalCellSize + cellSize / 2, -4)
      }
    }

    // Draw legend
    const legendX = 10
    const legendY = 7 * totalCellSize + 20
    const legendWidth = 150
    const legendHeight = 10

    const legendGradient = ctx.createLinearGradient(legendX, legendY, legendX + legendWidth, legendY)
    legendGradient.addColorStop(0, getHeatColor(0))
    legendGradient.addColorStop(0.25, getHeatColor(0.25))
    legendGradient.addColorStop(0.5, getHeatColor(0.5))
    legendGradient.addColorStop(0.75, getHeatColor(0.75))
    legendGradient.addColorStop(1, getHeatColor(1))

    ctx.fillStyle = legendGradient
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight)

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
    ctx.textAlign = "center"
    ctx.fillText("Less", legendX, legendY + 25)
    ctx.fillText("More", legendX + legendWidth, legendY + 25)
  }, [data, startDate, endDate])

  // Get color for heat intensity
  function getHeatColor(intensity: number): string {
    // Green color scale from light to dark
    const r = Math.round(229 - intensity * 180)
    const g = Math.round(231 - intensity * 70)
    const b = Math.round(235 - intensity * 170)

    return `rgb(${r}, ${g}, ${b})`
  }

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: "700px", height: "160px" }}>
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
      </div>
    </div>
  )
}

