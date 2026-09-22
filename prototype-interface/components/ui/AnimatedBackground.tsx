'use client'

import React, { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    // Particle system configuration
    const particleCount = Math.min(50, Math.floor(width / 25))
    const particles: {
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      alpha: number
      alphaSpeed: number
    }[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 3 + 1.5, // Vivid 1.5px - 4.5px particles
        vx: (Math.random() - 0.5) * 0.6,
        vy: -Math.random() * 0.7 - 0.2, // Floating upwards gently
        alpha: Math.random() * 0.7 + 0.3,
        alphaSpeed: (Math.random() - 0.5) * 0.012,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Detect current active theme color for particles
      const isDark = document.documentElement.classList.contains('dark')
      const isPink = document.documentElement.classList.contains('pink')

      let particleRgb = '99, 102, 241' // Default Indigo/Purple
      if (isDark) {
        particleRgb = '129, 140, 248' // Bright indigo in dark mode
      } else if (isPink) {
        particleRgb = '236, 72, 153' // Pink/Rose
      }

      // Draw particle connections & points
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Update positions
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.alphaSpeed

        if (p.alpha <= 0.2 || p.alpha >= 0.9) {
          p.alphaSpeed = -p.alphaSpeed
        }

        // Wrap around screen boundaries
        if (p.y < -10) p.y = height + 10
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        // Draw glowing particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particleRgb}, ${p.alpha})`
        ctx.shadowBlur = 12
        ctx.shadowColor = `rgba(${particleRgb}, 0.8)`
        ctx.fill()

        // Connect nearby particles with glowing lines
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            const lineAlpha = (1 - dist / 130) * 0.25 * Math.min(p.alpha, p2.alpha)
            ctx.strokeStyle = `rgba(${particleRgb}, ${lineAlpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div className="animated-bg-container fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic Glowing Vivid Aurora Mesh Orbs */}
      <div className="aurora-orb orb-1" />
      <div className="aurora-orb orb-2" />
      <div className="aurora-orb orb-3" />
      <div className="aurora-orb orb-4" />

      {/* Floating Constellation Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />

      {/* Modern Radial Grid Mesh Overlay */}
      <div className="bg-grid-pattern absolute inset-0 opacity-[0.06] dark:opacity-[0.1] pink:opacity-[0.08]" />

      {/* Floating Geometric Ambient Rings */}
      <div className="geo-ring ring-1" />
      <div className="geo-ring ring-2" />
      <div className="geo-ring ring-3" />
    </div>
  )
}
