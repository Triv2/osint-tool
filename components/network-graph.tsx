"use client"

import { useEffect, useRef } from "react"

interface Node {
  id: string
  label: string
  type: "ip" | "domain" | "email" | "hash" | "case"
  size?: number
}

interface Edge {
  source: string
  target: string
  label?: string
}

interface NetworkGraphProps {
  nodes: Node[]
  edges: Edge[]
  height?: number
}

export function NetworkGraph({ nodes, edges, height = 400 }: NetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Node colors by type
  const nodeColors = {
    ip: "#3b82f6", // blue
    domain: "#10b981", // green
    email: "#ef4444", // red
    hash: "#8b5cf6", // purple
    case: "#f59e0b", // amber
  }

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = height

    // Physics simulation parameters
    const simulation = {
      nodePositions: new Map<string, { x: number; y: number; vx: number; vy: number }>(),
      linkStrength: 0.1,
      repulsionStrength: 10,
      centerStrength: 0.01,
      friction: 0.9,
      iterations: 100,
    }

    // Initialize node positions
    nodes.forEach((node) => {
      simulation.nodePositions.set(node.id, {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
      })
    })

    // Run physics simulation
    for (let i = 0; i < simulation.iterations; i++) {
      // Apply forces

      // Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i]
          const nodeB = nodes[j]
          const posA = simulation.nodePositions.get(nodeA.id)!
          const posB = simulation.nodePositions.get(nodeB.id)!

          const dx = posB.x - posA.x
          const dy = posB.y - posA.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1
          const force = simulation.repulsionStrength / (distance * distance)

          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          posA.vx -= fx
          posA.vy -= fy
          posB.vx += fx
          posB.vy += fy
        }
      }

      // Attraction along edges
      edges.forEach((edge) => {
        const sourcePos = simulation.nodePositions.get(edge.source)!
        const targetPos = simulation.nodePositions.get(edge.target)!

        const dx = targetPos.x - sourcePos.x
        const dy = targetPos.y - sourcePos.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 1
        const force = distance * simulation.linkStrength

        const fx = (dx / distance) * force
        const fy = (dy / distance) * force

        sourcePos.vx += fx
        sourcePos.vy += fy
        targetPos.vx -= fx
        targetPos.vy -= fy
      })

      // Center gravity
      nodes.forEach((node) => {
        const pos = simulation.nodePositions.get(node.id)!
        const dx = canvas.width / 2 - pos.x
        const dy = canvas.height / 2 - pos.y

        pos.vx += dx * simulation.centerStrength
        pos.vy += dy * simulation.centerStrength
      })

      // Update positions
      nodes.forEach((node) => {
        const pos = simulation.nodePositions.get(node.id)!

        // Apply friction
        pos.vx *= simulation.friction
        pos.vy *= simulation.friction

        // Update position
        pos.x += pos.vx
        pos.y += pos.vy

        // Constrain to canvas
        pos.x = Math.max(50, Math.min(canvas.width - 50, pos.x))
        pos.y = Math.max(50, Math.min(canvas.height - 50, pos.y))
      })
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw edges
    edges.forEach((edge) => {
      const sourcePos = simulation.nodePositions.get(edge.source)!
      const targetPos = simulation.nodePositions.get(edge.target)!

      ctx.beginPath()
      ctx.moveTo(sourcePos.x, sourcePos.y)
      ctx.lineTo(targetPos.x, targetPos.y)
      ctx.strokeStyle = "rgba(150, 150, 150, 0.3)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Draw edge label if provided
      if (edge.label) {
        const midX = (sourcePos.x + targetPos.x) / 2
        const midY = (sourcePos.y + targetPos.y) / 2

        ctx.font = "10px sans-serif"
        ctx.fillStyle = "rgba(100, 100, 100, 0.8)"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(edge.label, midX, midY)
      }
    })

    // Draw nodes
    nodes.forEach((node) => {
      const pos = simulation.nodePositions.get(node.id)!
      const size = node.size || 10

      // Draw node circle
      ctx.beginPath()
      ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI)
      ctx.fillStyle = nodeColors[node.type] || "#888888"
      ctx.fill()
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw node label
      ctx.font = "12px sans-serif"
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground")
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.label, pos.x, pos.y + size + 12)
    })
  }, [nodes, edges, height])

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <canvas ref={canvasRef} className="w-full h-full"></canvas>
    </div>
  )
}

