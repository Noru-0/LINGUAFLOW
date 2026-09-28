// Pure Zero-Dependency HTML5 Canvas Particle Confetti and Web Audio Chimes

export function playSuccessChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime

    // Note 1: High crisp pleasant chime (C6 -> E6)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1046.5, now)
    osc1.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08)

    gain1.gain.setValueAtTime(0.2, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Note 2: Harmonious resonance (G6)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(1318.5, now + 0.07)
    osc2.frequency.exponentialRampToValueAtTime(1567.98, now + 0.15)

    gain2.gain.setValueAtTime(0, now)
    gain2.gain.setValueAtTime(0.18, now + 0.07)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.07)
    osc2.stop(now + 0.5)
  } catch {}
}

export function playErrorChime() {
  if (typeof window === 'undefined') return
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.2)

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.25)
  } catch {}
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  vRot: number
  shape: 'rect' | 'circle' | 'star'
  alpha: number
  decay: number
}

function getOrCreateConfettiCanvas(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null
  let canvas = document.getElementById('linguaflow-confetti-canvas') as HTMLCanvasElement
  if (!canvas) {
    canvas = document.createElement('canvas')
    canvas.id = 'linguaflow-confetti-canvas'
    canvas.style.position = 'fixed'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100vw'
    canvas.style.height = '100vh'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '99999'
    document.body.appendChild(canvas)
  }
  canvas.width = window.innerWidth * window.devicePixelRatio
  canvas.height = window.innerHeight * window.devicePixelRatio
  return canvas
}

let activeParticles: Particle[] = []
let animationFrameId: number | null = null

function updateAndRenderParticles() {
  const canvas = getOrCreateConfettiCanvas()
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (activeParticles.length === 0) {
    animationFrameId = null
    return
  }

  for (let i = activeParticles.length - 1; i >= 0; i--) {
    const p = activeParticles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.22 // gravity
    p.vx *= 0.985 // drag
    p.rotation += p.vRot
    p.alpha -= p.decay

    if (p.alpha <= 0 || p.y > window.innerHeight + 50) {
      activeParticles.splice(i, 1)
      continue
    }

    ctx.save()
    ctx.translate(p.x * dpr, p.y * dpr)
    ctx.rotate(p.rotation)
    ctx.globalAlpha = Math.max(0, p.alpha)
    ctx.fillStyle = p.color

    if (p.shape === 'rect') {
      ctx.fillRect(-p.size * dpr / 2, -p.size * dpr / 4, p.size * dpr, (p.size * dpr) / 2)
    } else if (p.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(0, 0, (p.size * dpr) / 2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Star / Sparkle
      const s = (p.size * dpr) / 1.5
      ctx.beginPath()
      ctx.moveTo(0, -s)
      ctx.lineTo(s * 0.3, -s * 0.3)
      ctx.lineTo(s, 0)
      ctx.lineTo(s * 0.3, s * 0.3)
      ctx.lineTo(0, s)
      ctx.lineTo(-s * 0.3, s * 0.3)
      ctx.lineTo(-s, 0)
      ctx.lineTo(-s * 0.3, -s * 0.3)
      ctx.closePath()
      ctx.fill()
    }

    ctx.restore()
  }

  animationFrameId = requestAnimationFrame(updateAndRenderParticles)
}

const PALETTE = [
  '#10b981', '#34d399', '#6366f1', '#818cf8',
  '#f59e0b', '#fbbf24', '#ec4899', '#f472b6',
  '#3b82f6', '#60a5fa', '#a855f7'
]

export function triggerConfetti(options?: { count?: number; origin?: { x: number; y: number } }) {
  if (typeof window === 'undefined') return
  const count = options?.count || 40
  const originX = options?.origin?.x ?? window.innerWidth / 2
  const originY = options?.origin?.y ?? window.innerHeight * 0.55

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
    const speed = 4 + Math.random() * 8.5
    const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star']

    activeParticles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4.5, // initial upward kick
      size: 7 + Math.random() * 7,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.25,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      alpha: 1,
      decay: 0.012 + Math.random() * 0.015,
    })
  }

  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(updateAndRenderParticles)
  }
}

export function triggerBatchCompleteCelebration() {
  if (typeof window === 'undefined') return

  // Left cannon burst
  triggerConfetti({ count: 45, origin: { x: window.innerWidth * 0.2, y: window.innerHeight * 0.6 } })
  
  // Right cannon burst
  setTimeout(() => {
    triggerConfetti({ count: 45, origin: { x: window.innerWidth * 0.8, y: window.innerHeight * 0.6 } })
  }, 160)

  // Center grand burst
  setTimeout(() => {
    triggerConfetti({ count: 60, origin: { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45 } })
  }, 350)
}
