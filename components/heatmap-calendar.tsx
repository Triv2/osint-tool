"use client"

import { useEffect, useRef } from "react"

interface HeatmapData {
  date: Date
  count: number
}

interface HeatmapCalendarProps {
  data: HeatmapData[]
  startDate?: Date
  endDate?: Date
  height?: number
}

export function HeatmapCalendar({
  data,
  startDate = new Date(new Date().setDate(new Date().getDate() - 90)),
  endDate = new Date(),
  height = 200,
}: HeatmapCalendarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = height

    // Prepare data
    const dataMap = new Map<string, number>()
    data.forEach((item) => {
      const dateStr = item.date.toISOString().split("T")[0]
      dataMap.set(dateStr, (dataMap.get(dateStr) || 0) + item.count)
    })

    // Find max count for color scaling
    const maxCount = Math.max(...data.map((d) => d.count), 1)

    // Calculate date range
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    // Calculate cell size
    const padding = { left: 50, right: 20, top: 30, bottom: 30 }
    const innerWidth = canvas.width - padding.left - padding.right
    const innerHeight = canvas.height - padding.top - padding.bottom

    const cellSize = Math.min(
      innerWidth / daysDiff,
      innerHeight / 7, // 7 days in a week
    )

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw month labels
    const months = []
    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const month = currentDate.getMonth()
      const year = currentDate.getFullYear()
      const key = `${year}-${month}`

      if (!months.includes(key)) {
        months.push(key)
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    months.forEach((monthKey) => {
      const [year, month] = monthKey.split("-").map(Number)
      const date = new Date(year, month, 1)
      const monthName = date.toLocaleString("default", { month: "short" })

      const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const x = padding.left + daysSinceStart * cellSize

      ctx.font = "12px sans-serif"
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText(monthName, x, padding.top - 20)
    })

    // Draw day labels
    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    dayLabels.forEach((day, i) => {
      const y = padding.top + i * cellSize + cellSize / 2

      ctx.font = "10px sans-serif"
      ctx.fillStyle = "rgba(100, 100, 100, 0.8)"
      ctx.textAlign = "right"
      ctx.textBaseline = "middle"
      ctx.fillText(day, padding.left - 10, y)
    })

    // Draw heatmap cells
    currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0]
      const count = dataMap.get(dateStr) || 0

      const daysSinceStart = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const dayOfWeek = currentDate.getDay() // 0 = Sunday, 6 = Saturday

      const x = padding.left + daysSinceStart * cellSize
      const y = padding.top + dayOfWeek * cellSize

      // Calculate color intensity based on count
      const intensity = count / maxCount
      const r = Math.round(10 + intensity * 59) // 10-69
      const g = Math.round(102 + intensity * 153) // 102-255
      const b = Math.round(102 + intensity * 51) // 102-153

      // Draw cell
      ctx.beginPath()
      ctx.rect(x, y, cellSize - 1, cellSize - 1)
      ctx.fillStyle = count > 0 ? `rgb(${r}, ${g}, ${b})` : "rgba(240, 240, 240, 0.5)"
      ctx.fill()

      // Draw count if > 0
      if (count > 0) {
        ctx.font = "10px sans-serif"
        ctx.fillStyle = intensity > 0.5 ? "white" : "rgba(0, 0, 0, 0.7)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(count.toString(), x + cellSize / 2, y + cellSize / 2)
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Draw legend
    const legendWidth = 150
    const legendHeight = 20
    const legendX = canvas.width - legendWidth - padding.right
    const legendY = canvas.height - legendHeight - 10

    // Draw legend gradient
    const legendGradient = ctx.createLinearGradient(legendX, legendY, legendX + legendWidth, legendY)
    legendGradient.addColorStop(0, "rgb(10, 102, 102)")
    legendGradient.addColorStop(0.5, "rgb(40, 178, 128)")
    legendGradient.addColorStop(1, "rgb(69, 255, 153)")

    ctx.fillStyle = legendGradient
    ctx.fillRect(legendX, legendY, legendWidth, legendHeight)

    // Draw legend labels
    ctx.font = "10px sans-serif"
    ctx.fillStyle = "rgba(100, 100, 100, 0.8)"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Less", legendX, legendY + legendHeight + 5)
    ctx.fillText("More", legendX + legendWidth, legendY + legendHeight + 5)
  }, [data, startDate, endDate, height])

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}

