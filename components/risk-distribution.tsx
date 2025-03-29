"use client"

import { useEffect, useRef } from "react"

export function RiskDistribution() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Data for the donut chart
    const data = [
      { label: "High Risk", value: 23, color: "#ef4444" },
      { label: "Medium Risk", value: 45, color: "#f59e0b" },
      { label: "Low Risk", value: 59, color: "#10b981" },
    ]

    const total = data.reduce((sum, item) => sum + item.value, 0)
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8
    const innerRadius = radius * 0.6

    // Draw the donut chart
    let startAngle = 0

    data.forEach((item) => {
      const sliceAngle = (2 * Math.PI * item.value) / total

      // Draw the slice
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle)
      ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = item.color
      ctx.fill()

      // Calculate the middle angle for the label
      const middleAngle = startAngle + sliceAngle / 2

      // Position for the percentage text
      const textX = centerX + (innerRadius + (radius - innerRadius) / 2) * Math.cos(middleAngle)
      const textY = centerY + (innerRadius + (radius - innerRadius) / 2) * Math.sin(middleAngle)

      // Draw the percentage
      const percentage = Math.round((item.value / total) * 100)
      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = "#ffffff"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${percentage}%`, textX, textY)

      startAngle += sliceAngle
    })

    // Draw center circle (for donut hole)
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI)
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background")
    ctx.fill()

    // Draw total in the center
    ctx.font = "bold 16px sans-serif"
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(total.toString(), centerX, centerY - 10)

    ctx.font = "12px sans-serif"
    ctx.fillText("Total Cases", centerX, centerY + 10)

    // Draw legend
    const legendX = 10
    let legendY = canvas.height - 80

    data.forEach((item) => {
      // Draw color box
      ctx.fillStyle = item.color
      ctx.fillRect(legendX, legendY, 15, 15)

      // Draw label
      ctx.font = "12px sans-serif"
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
      ctx.textAlign = "left"
      ctx.textBaseline = "middle"
      ctx.fillText(`${item.label} (${item.value})`, legendX + 25, legendY + 7.5)

      legendY += 25
    })
  }, [])

  return (
    <div className="w-full h-[300px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}

