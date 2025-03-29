"use client"

import { useEffect, useRef } from "react"

// Sample threat data with coordinates
const threatData = [
  { lat: 40.7128, lng: -74.006, intensity: 0.8, label: "New York" }, // New York
  { lat: 51.5074, lng: -0.1278, intensity: 0.6, label: "London" }, // London
  { lat: 48.8566, lng: 2.3522, intensity: 0.5, label: "Paris" }, // Paris
  { lat: 55.7558, lng: 37.6173, intensity: 0.9, label: "Moscow" }, // Moscow
  { lat: 39.9042, lng: 116.4074, intensity: 0.7, label: "Beijing" }, // Beijing
  { lat: 35.6762, lng: 139.6503, intensity: 0.4, label: "Tokyo" }, // Tokyo
  { lat: -33.8688, lng: 151.2093, intensity: 0.3, label: "Sydney" }, // Sydney
  { lat: -23.5505, lng: -46.6333, intensity: 0.5, label: "São Paulo" }, // São Paulo
  { lat: 19.4326, lng: -99.1332, intensity: 0.6, label: "Mexico City" }, // Mexico City
  { lat: 28.6139, lng: 77.209, intensity: 0.8, label: "New Delhi" }, // New Delhi
]

export function ThreatMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw world map outline (simplified)
    drawWorldMap(ctx, canvas.width, canvas.height)

    // Draw threat hotspots
    threatData.forEach((threat) => {
      const { x, y } = latLngToPoint(threat.lat, threat.lng, canvas.width, canvas.height)
      drawHotspot(ctx, x, y, threat.intensity, threat.label)
    })
  }, [])

  // Convert latitude and longitude to x, y coordinates on the canvas
  function latLngToPoint(lat: number, lng: number, width: number, height: number) {
    // Simple Mercator projection
    const x = (lng + 180) * (width / 360)
    const latRad = (lat * Math.PI) / 180
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
    const y = height / 2 - (width * mercN) / (2 * Math.PI)
    return { x, y }
  }

  // Draw a threat hotspot
  function drawHotspot(ctx: CanvasRenderingContext2D, x: number, y: number, intensity: number, label: string) {
    // Create gradient for the hotspot
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30 * intensity)
    gradient.addColorStop(0, `rgba(239, 68, 68, ${intensity})`) // Red with intensity-based opacity
    gradient.addColorStop(1, "rgba(239, 68, 68, 0)")

    // Draw the hotspot
    ctx.beginPath()
    ctx.arc(x, y, 30 * intensity, 0, 2 * Math.PI)
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw a small dot at the center
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fillStyle = "rgba(239, 68, 68, 1)"
    ctx.fill()

    // Draw the label
    ctx.font = "10px sans-serif"
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
    ctx.textAlign = "center"
    ctx.fillText(label, x, y + 15)
  }

  // Draw a simplified world map outline
  function drawWorldMap(ctx: CanvasRenderingContext2D, width: number, height: number) {
    // This is a very simplified world map drawing
    // In a real application, you would use GeoJSON data and proper mapping

    ctx.beginPath()
    ctx.rect(0, 0, width, height)
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
    ctx.fill()

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.lineWidth = 0.5

    // Draw longitude lines
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = (lng + 180) * (width / 360)
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw latitude lines
    for (let lat = -90; lat <= 90; lat += 30) {
      const latRad = (lat * Math.PI) / 180
      const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2))
      const y = height / 2 - (width * mercN) / (2 * Math.PI)

      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Add a legend
    ctx.font = "12px sans-serif"
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
    ctx.textAlign = "left"
    ctx.fillText("Threat Intensity:", 10, 20)

    // Draw legend gradient
    const legendWidth = 100
    const legendHeight = 10
    const legendX = 110
    const legendY = 15

    const legendGradient = ctx.createLinearGradient(legendX, legendY, legendX + legendWidth, legendY)
    legendGradient.addColorStop(0, "rgba(239, 68, 68, 0.2)")
    legendGradient.addColorStop(1, "rgba(239, 68, 68, 1)")

    ctx.fillStyle = legendGradient
    ctx.fillRect(legendX, legendY - legendHeight / 2, legendWidth, legendHeight)

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
    ctx.textAlign = "center"
    ctx.fillText("Low", legendX, legendY + 15)
    ctx.fillText("High", legendX + legendWidth, legendY + 15)
  }

  return (
    <div className="w-full h-[400px] bg-muted/30 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}

