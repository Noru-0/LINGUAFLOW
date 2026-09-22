'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Animal {
  emoji: string
  name: string
  messages: string[]
  reactions: string[]
}

const ANIMALS: Animal[] = [
  {
    emoji: '🐱',
    name: 'Mèo Chăm Học',
    messages: ['Meow! 🐾 Học tốt nhé!', 'Meow ~ Bạn đã học bao nhiêu từ rồi?', 'Nyan! Chăm chỉ ghê!'],
    reactions: ['Mèo nhảy cẫng! 🐾 +10 XP!', 'Nyan! ~ ✨ Bye bye!', 'Purrrr 💖 Yêu bạn!'],
  },
  {
    emoji: '🐶',
    name: 'Cún Năng Động',
    messages: ['Woof! 🐕 Cố lên bạn ơi!', 'Gâu gâu! LinguaFlow đỉnh quá!', 'Woof! Giữ vững streak nhé!'],
    reactions: ['Gâu gâu! 🦴 Siêu cấp đáng yêu!', 'Woof woof! 💨 Vùuuu!', 'Hạnh phúc quá! 🐶✨'],
  },
  {
    emoji: '🦊',
    name: 'Cáo Lanh Lợi',
    messages: ['Ring-ding-ding! 🦊 Tuần này học chăm thế!', '🦊 Bí kíp IELTS nằm ở sự kiên trì!'],
    reactions: ['Hí hí! 🌟 Chạy lẹ thôi!', 'Vùuuu 🦊 Tiên phong!', 'Bí mật khai mở! ✨'],
  },
  {
    emoji: '🐼',
    name: 'Gấu Trúc Đáng Yêu',
    messages: ['Panda power! 🐼 Đừng bỏ cuộc!', 'Chậm mà chắc nha! 🎋', 'Gấu trúc đồng hành cùng bạn! 🐼'],
    reactions: ['Bập bập! 🎋 Chăm chỉ quá!', 'Lăn tròn! 🐼 Bye bye!', 'Ngủ khò khò ~ 💖'],
  },
  {
    emoji: '🐇',
    name: 'Thỏ Siêu Tốc',
    messages: ['Hop hop! 🐰 Năng lượng tràn đầy!', 'Tăng tốc ôn tập nào! 🥕', 'Bứt phá mục tiêu hôm nay! 🚀'],
    reactions: ['Nhảy cẫng! 🥕 +100 Momentum!', 'Vùuu! 🐰 Chạy biến!', 'Quá nhanh quá nguy hiểm! ✨'],
  },
  {
    emoji: '🐧',
    name: 'Chim Cánh Cụt',
    messages: ['Waddle waddle! 🐧 Học mỗi ngày!', '🧊 Giữ cái đầu lạnh ôn thi!', 'LinguaFlow cố lên! 🧊'],
    reactions: ['Trượt tuyết! 🧊 Bye bye!', 'Waddle! 🐧✨ Siêu đỉnh!', 'Pingu Pingu! 💙'],
  },
  {
    emoji: '🦄',
    name: 'Kỳ Lân Phép Thuật',
    messages: ['Sparkle power! 🦄 Bạn là siêu sao!', 'Phép thuật từ vựng! ✨', 'Rạng rỡ mỗi ngày! 🌈'],
    reactions: ['Tảo biển phép thuật! ✨ 💖', 'Rainbow Dash! 🌈 Vùuu!', 'Magic +999 XP! 🦄'],
  },
  {
    emoji: '🦖',
    name: 'Dino Khủng Long',
    messages: ['Rawr! 🦖 Chinh phục C1/C2!', 'Không gì ngăn cản được bạn! 🔥', 'Dino đồng hành cùng bạn! 🦖'],
    reactions: ['GRRR! 🦖 Chạy lẹ thôi!', 'Dino Jump! 💥 Boom!', 'Khủng long siêu cấp! 🦖⚡'],
  },
  {
    emoji: '🐝',
    name: 'Ong Chăm Chỉ',
    messages: ['Buzz buzz! 🐝 Chăm như ong!', 'Góp nhặt từ vựng mỗi ngày! 🍯', 'Ong vàng mang tin vui! ✨'],
    reactions: ['Bzzzz! 🍯 Thêm ngọt ngào!', 'Bay vút lên trời! 🐝✨', 'Ong vàng gửi yêu thương! 💖'],
  },
  {
    emoji: '🦆',
    name: 'Vịt Vui Vẻ',
    messages: ['Quack quack! 🦆 Bạn thật tuyệt vời!', 'Cáp cáp! Tiếp tục nào! 🌊', 'Quack! Học từ vựng thật vui! 🎉'],
    reactions: ['Cáp cáp! 🌊 Biến mất!', 'Quack Quack! 🦆 Bye bye!', 'Vịt lội suối! 💦'],
  },
]

export function EasterEggMascot() {
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [positionX, setPositionX] = useState<number>(-100)
  const [walkProgress, setWalkProgress] = useState<number>(0)
  const [direction, setDirection] = useState<'left-to-right' | 'right-to-left'>('left-to-right')
  const [status, setStatus] = useState<'hidden' | 'walking' | 'clicked'>('hidden')
  const [message, setMessage] = useState<string>('')
  const [reactionText, setReactionText] = useState<string>('')
  const [particles, setParticles] = useState<string[]>([])
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const isWalkingRef = useRef<boolean>(false)

  // Schedule next animal appearance
  const scheduleNextAppearance = (minDelayMs = 10000, maxDelayMs = 20000) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    const delay = Math.floor(Math.random() * (maxDelayMs - minDelayMs)) + minDelayMs
    
    timerRef.current = setTimeout(() => {
      spawnAnimal()
    }, delay)
  }

  const spawnAnimal = () => {
    const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    const randomMessage = randomAnimal.messages[Math.floor(Math.random() * randomAnimal.messages.length)]
    const isLeftToRight = Math.random() > 0.5
    const dir = isLeftToRight ? 'left-to-right' : 'right-to-left'
    
    setAnimal(randomAnimal)
    setMessage(randomMessage)
    setDirection(dir)
    setWalkProgress(0)
    setStatus('walking')
    isWalkingRef.current = true

    const startX = isLeftToRight ? -90 : (typeof window !== 'undefined' ? window.innerWidth + 30 : 1200)
    setPositionX(startX)
  }

  // Animation movement loop (Slow & Gentle Walk ~0.8px/frame)
  useEffect(() => {
    if (status !== 'walking') return

    const isLeftToRight = direction === 'left-to-right'
    const startX = isLeftToRight ? -90 : (typeof window !== 'undefined' ? window.innerWidth + 30 : 1200)
    const targetX = isLeftToRight ? (typeof window !== 'undefined' ? window.innerWidth + 90 : 1300) : -90
    const speed = isLeftToRight ? 0.8 : -0.8
    const totalDist = Math.abs(targetX - startX)

    let currentX = positionX

    const move = () => {
      if (!isWalkingRef.current) return
      
      currentX += speed
      setPositionX(currentX)

      const traveledDist = Math.abs(currentX - startX)
      const prog = Math.min(100, Math.max(0, (traveledDist / totalDist) * 100))
      setWalkProgress(prog)

      if ((isLeftToRight && currentX > targetX) ||
          (!isLeftToRight && currentX < targetX)) {
        isWalkingRef.current = false
        setStatus('hidden')
        scheduleNextAppearance(12000, 22000)
        return
      }

      animFrameRef.current = requestAnimationFrame(move)
    }

    animFrameRef.current = requestAnimationFrame(move)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [status, direction])

  // Initial schedule on mount
  useEffect(() => {
    scheduleNextAppearance(10000, 20000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      isWalkingRef.current = false
    }
  }, [])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (status !== 'walking' || !animal) return

    isWalkingRef.current = false
    setStatus('clicked')

    const randomReaction = animal.reactions[Math.floor(Math.random() * animal.reactions.length)]
    setReactionText(randomReaction)
    setParticles(['💖', '✨', '🐾', '🌟', '🎉'])

    setTimeout(() => {
      setStatus('hidden')
      scheduleNextAppearance(12000, 22000)
    }, 800)
  }

  if (status === 'hidden' || !animal) return null

  return (
    <div
      className={`easter-egg-container ${status === 'clicked' ? 'clicked' : ''}`}
      style={{
        left: `${positionX}px`,
        bottom: '10px',
      }}
      onClick={handleClick}
      title="Click me!"
    >
      {/* Speech Bubble */}
      <div className="easter-egg-speech">
        {status === 'clicked' ? reactionText : message}
      </div>

      {/* Floating Click Particles */}
      {status === 'clicked' && (
        <div className="easter-egg-particles">
          {particles.map((p, idx) => (
            <span key={idx} style={{ margin: '0 2px' }}>
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Animal Body */}
      <div
        style={{
          transform: direction === 'left-to-right' ? 'scaleX(-1)' : 'scaleX(1)',
          display: 'inline-block',
        }}
      >
        <div className="easter-egg-body">{animal.emoji}</div>
      </div>

      {/* Progress Bar under feet */}
      <div className="easter-egg-progress-track">
        <div
          className="easter-egg-progress-fill"
          style={{ width: `${walkProgress}%` }}
        />
      </div>
    </div>
  )
}

