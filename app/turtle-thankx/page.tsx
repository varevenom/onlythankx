'use client'

import { useEffect, useRef, useState } from 'react'

type Turtle = {
  id: number
  x: number
  y: number
  size: number
  vx: number
  saved: boolean
  lost: boolean
  hatchDelay: number
  wiggle: number
  boost: number
}

type Crab = {
  id: number
  x: number
  y: number
  size: number
  vx: number
  minX: number
  maxX: number
  flipped: boolean
  flipTimer: number
  legWiggle: number
}

type Bird = {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  state: 'flying' | 'warning' | 'diving' | 'rising'
  timer: number
}

type SeaLion = {
  id: number
  x: number
  y: number
  w: number
  h: number
  vx: number
  timer: number
}

type Item = {
  id: number
  x: number
  y: number
  kind: 'shell' | 'coconut' | 'slipper'
  collected: boolean
}

type Wave = {
  active: boolean
  y: number
  height: number
  power: number
  direction: -1 | 1
  retreating: boolean
}

const W = 1000
const H = 620
const OCEAN_Y = 95
const NEST_Y = 540
const TOTAL_TURTLES = 18

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n))

const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y)

export default function TurtleThankxPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const keysRef = useRef<Record<string, boolean>>({})

  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [saved, setSaved] = useState(0)
  const [lost, setLost] = useState(0)
  const [message, setMessage] = useState('Guide the hatchlings to the sea 🌊')

  const turtlesRef = useRef<Turtle[]>([])
  const crabsRef = useRef<Crab[]>([])
  const birdsRef = useRef<Bird[]>([])
  const seaLionsRef = useRef<SeaLion[]>([])
  const itemsRef = useRef<Item[]>([])

  const waveRef = useRef<Wave>({
    active: false,
    y: OCEAN_Y,
    height: 50,
    power: 0.8,
    direction: 1,
    retreating: false,
  })

  const waveCooldownRef = useRef(260)
  const birdCooldownRef = useRef(180)
  const seaLionCooldownRef = useRef(520)
  const timeRef = useRef(0)

  const resetGame = () => {
    turtlesRef.current = Array.from({ length: TOTAL_TURTLES }, (_, i) => ({
      id: i + 1,
      x: 450 + (i % 6) * 18 + Math.random() * 8,
      y: NEST_Y + Math.floor(i / 6) * 10,
      size: 13 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 0.35,
      saved: false,
      lost: false,
      hatchDelay: i * 22,
      wiggle: Math.random() * Math.PI * 2,
      boost: 0,
    }))

    crabsRef.current = [
      { id: 1, x: 150, y: 430, size: 28, vx: 1.3, minX: 80, maxX: 300, flipped: false, flipTimer: 0, legWiggle: 0 },
      { id: 2, x: 520, y: 360, size: 30, vx: -1.45, minX: 410, maxX: 690, flipped: false, flipTimer: 0, legWiggle: 0 },
      { id: 3, x: 770, y: 260, size: 27, vx: 1.25, minX: 660, maxX: 900, flipped: false, flipTimer: 0, legWiggle: 0 },
      { id: 4, x: 310, y: 220, size: 25, vx: -1.1, minX: 210, maxX: 400, flipped: false, flipTimer: 0, legWiggle: 0 },
    ]

    birdsRef.current = [
      { id: 1, x: 170, y: 55, targetX: 170, targetY: 330, state: 'flying', timer: 0 },
      { id: 2, x: 820, y: 70, targetX: 820, targetY: 280, state: 'flying', timer: 70 },
    ]

    seaLionsRef.current = []

    itemsRef.current = [
      { id: 1, x: 105, y: 500, kind: 'shell', collected: false },
      { id: 2, x: 320, y: 455, kind: 'coconut', collected: false },
      { id: 3, x: 620, y: 500, kind: 'slipper', collected: false },
      { id: 4, x: 760, y: 440, kind: 'shell', collected: false },
      { id: 5, x: 245, y: 345, kind: 'slipper', collected: false },
      { id: 6, x: 890, y: 335, kind: 'coconut', collected: false },
      { id: 7, x: 530, y: 250, kind: 'shell', collected: false },
      { id: 8, x: 420, y: 165, kind: 'coconut', collected: false },
    ]

    waveRef.current = {
      active: false,
      y: OCEAN_Y,
      height: 50,
      power: 0.8,
      direction: 1,
      retreating: false,
    }

    waveCooldownRef.current = 240
    birdCooldownRef.current = 150
    seaLionCooldownRef.current = 460
    timeRef.current = 0

    setScore(0)
    setSaved(0)
    setLost(0)
    setMessage('Guide the hatchlings to the sea 🌊')
    setStarted(true)
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true
      if (e.key === ' ') e.preventDefault()
    }

    const up = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    let last = performance.now()

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16.6667, 1.7)
      last = now

      update(dt)
      draw()

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [started])

  const activeTurtles = () =>
    turtlesRef.current.filter((t) => !t.saved && !t.lost && t.hatchDelay <= 0)

  const updateTurtles = (dt: number) => {
    const keys = keysRef.current
    const steer =
      (keys['arrowleft'] || keys['a'] ? -1 : 0) +
      (keys['arrowright'] || keys['d'] ? 1 : 0)

    const rush = keys[' '] ? 0.75 : 0

    turtlesRef.current.forEach((t) => {
      if (t.saved || t.lost) return

      if (t.hatchDelay > 0) {
        t.hatchDelay -= 1.2 * dt
        return
      }

      t.wiggle += 0.22 * dt
      t.boost = Math.max(0, t.boost - 0.02 * dt)

      t.vx += steer * 0.045 * dt
      t.vx += Math.sin(t.wiggle) * 0.012 * dt
      t.vx *= 0.985

      t.y -= (0.62 + rush + t.boost) * dt
      t.x += t.vx * dt * 4

      t.x = clamp(t.x, 20, W - 20)

      if (t.y <= OCEAN_Y + 20) {
        t.saved = true
        setSaved((prev) => prev + 1)
        setScore((prev) => prev + 100)
      }
    })
  }

  const updateCrabs = (dt: number) => {
    crabsRef.current.forEach((c) => {
      if (c.flipped) {
        c.flipTimer -= dt
        c.legWiggle += 0.9 * dt
        c.x += Math.sin(c.legWiggle) * 0.18 * dt

        if (c.flipTimer <= 0) {
          c.flipped = false
          c.legWiggle = 0
        }

        return
      }

      c.x += c.vx * dt
      if (c.x < c.minX || c.x > c.maxX) c.vx *= -1

      activeTurtles().forEach((t) => {
        if (dist(c, t) < c.size * 0.72 + t.size) {
          t.lost = true
          setLost((prev) => prev + 1)
          setMessage('A crab grabbed a hatchling! 🦀')
        }
      })
    })
  }

  const chooseTurtleTarget = () => {
    const turtles = activeTurtles()
    if (turtles.length === 0) return { x: 500, y: 320 }

    const t = turtles[Math.floor(Math.random() * turtles.length)]
    return { x: t.x, y: t.y }
  }

  const updateBirds = (dt: number) => {
    birdCooldownRef.current -= dt

    if (birdCooldownRef.current <= 0) {
      birdCooldownRef.current = 180 + Math.random() * 120

      birdsRef.current.forEach((b) => {
        if (b.state === 'flying') {
          const target = chooseTurtleTarget()
          b.targetX = target.x
          b.targetY = target.y
          b.state = 'warning'
          b.timer = 65
        }
      })
    }

    birdsRef.current.forEach((b) => {
      if (b.state === 'flying') {
        b.x += Math.sin(timeRef.current / 60 + b.id) * 0.8 * dt
        return
      }

      if (b.state === 'warning') {
        b.timer -= dt
        if (b.timer <= 0) {
          b.state = 'diving'
          b.timer = 35
          b.x = b.targetX
          b.y = 45
        }
        return
      }

      if (b.state === 'diving') {
        b.timer -= dt
        b.y += 9 * dt

        if (b.y >= b.targetY) {
          activeTurtles().forEach((t) => {
            if (dist({ x: b.x, y: b.y }, t) < 34) {
              t.lost = true
              setLost((prev) => prev + 1)
              setMessage('A seagull swooped down! 🐦')
            }
          })

          b.state = 'rising'
          b.timer = 35
        }

        return
      }

      if (b.state === 'rising') {
        b.y -= 8 * dt

        if (b.y <= 55) {
          b.y = 55
          b.state = 'flying'
        }
      }
    })
  }

  const updateSeaLions = (dt: number) => {
    seaLionCooldownRef.current -= dt

    if (seaLionCooldownRef.current <= 0) {
      seaLionCooldownRef.current = 500 + Math.random() * 240

      seaLionsRef.current.push({
        id: Date.now(),
        x: Math.random() > 0.5 ? -120 : W + 120,
        y: 180 + Math.random() * 210,
        w: 95,
        h: 42,
        vx: Math.random() > 0.5 ? 1.8 : -1.8,
        timer: 340,
      })
    }

    seaLionsRef.current.forEach((s) => {
      s.x += s.vx * dt
      s.timer -= dt

      activeTurtles().forEach((t) => {
        if (
          t.x > s.x - 12 &&
          t.x < s.x + s.w + 12 &&
          t.y > s.y - 16 &&
          t.y < s.y + s.h + 16
        ) {
          t.vx += s.vx * 0.08
          t.y += 0.8 * dt
        }
      })
    })

    seaLionsRef.current = seaLionsRef.current.filter(
      (s) => s.timer > 0 && s.x > -180 && s.x < W + 180
    )
  }

  const updateItems = (dt: number) => {
    itemsRef.current.forEach((item) => {
      if (item.collected) return

      activeTurtles().forEach((t) => {
        if (dist(item, t) < 22) {
          if (item.kind === 'shell') {
            item.collected = true
            setScore((prev) => prev + 25)
          }

          if (item.kind === 'coconut') {
            item.collected = true
            t.boost = 1.3
            setScore((prev) => prev + 50)
            setMessage('Coconut boost! 🥥')
          }

          if (item.kind === 'slipper') {
            t.y += 10 * dt
            t.vx += (Math.random() - 0.5) * 0.2
          }
        }
      })
    })
  }

  const triggerWave = () => {
    waveRef.current = {
      active: true,
      y: OCEAN_Y + 5,
      height: 68,
      power: 1.15 + Math.random() * 0.45,
      direction: Math.random() > 0.5 ? 1 : -1,
      retreating: false,
    }

    setMessage('Rogue wave incoming! 🌊')
  }

  const updateWave = (dt: number) => {
    const wave = waveRef.current

    if (!wave.active) {
      waveCooldownRef.current -= dt

      if (waveCooldownRef.current <= 0) {
        waveCooldownRef.current = 360 + Math.random() * 220
        triggerWave()
      }

      return
    }

    if (!wave.retreating) {
      wave.y += 4.2 * dt
      if (wave.y >= 450) wave.retreating = true
    } else {
      wave.y -= 3.1 * dt

      if (wave.y <= OCEAN_Y + 5) {
        wave.active = false
        setMessage('Guide the hatchlings to the sea 🌊')
      }
    }

    activeTurtles().forEach((t) => {
      const inWave = t.y > wave.y - wave.height && t.y < wave.y + wave.height

      if (!inWave) return

      t.y -= wave.power * 1.15 * dt
      t.x += wave.direction * wave.power * 1.7 * dt
      t.vx += wave.direction * 0.025 * dt
    })

    crabsRef.current.forEach((c) => {
      const inWave = c.y > wave.y - wave.height && c.y < wave.y + wave.height

      if (!inWave || c.flipped) return

      c.flipped = true
      c.flipTimer = 120 + Math.random() * 80
      c.legWiggle = 0
      c.x += wave.direction * 22

      setScore((prev) => prev + 15)
    })

    itemsRef.current.forEach((item) => {
      if (item.collected) return

      const inWave = item.y > wave.y - wave.height && item.y < wave.y + wave.height

      if (inWave) {
        item.x = clamp(item.x + wave.direction * 0.9 * dt, 25, W - 25)
        item.y = clamp(item.y - 0.25 * dt, OCEAN_Y + 40, NEST_Y + 20)
      }
    })
  }

  const updateEndState = () => {
    const finished = turtlesRef.current.every((t) => t.saved || t.lost)

    if (finished && started) {
      setStarted(false)

      const savedCount = turtlesRef.current.filter((t) => t.saved).length

      if (savedCount === TOTAL_TURTLES) {
        setScore((prev) => prev + 1000)
        setMessage('Perfect rescue! Every tiny journey got a Thankx 🐢')
      } else if (savedCount > 0) {
        setMessage(`${savedCount} hatchlings made it home 🌊`)
      } else {
        setMessage('No hatchlings reached the sea. Try again 🐢')
      }
    }
  }

  const update = (dt: number) => {
    timeRef.current += dt

    if (!started) return

    updateTurtles(dt)
    updateCrabs(dt)
    updateBirds(dt)
    updateSeaLions(dt)
    updateItems(dt)
    updateWave(dt)
    updateEndState()
  }

  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    const sky = ctx.createLinearGradient(0, 0, 0, H)

    sky.addColorStop(0, '#07111f')
    sky.addColorStop(0.33, '#10233d')
    sky.addColorStop(0.34, '#18345d')
    sky.addColorStop(1, '#d9a45f')

    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#f6d49b'
    ctx.fillRect(0, OCEAN_Y + 35, W, H - OCEAN_Y - 35)

    ctx.fillStyle = '#0d3b66'
    ctx.fillRect(0, 0, W, OCEAN_Y + 45)

    ctx.fillStyle = '#dbeafe'
    ctx.beginPath()
    ctx.arc(825, 52, 30, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.65)'
    ctx.lineWidth = 2

    for (let i = 0; i < 7; i++) {
      const y = OCEAN_Y + 10 + i * 14 + Math.sin(timeRef.current / 20 + i) * 3

      ctx.beginPath()
      ctx.moveTo(0, y)

      for (let x = 0; x <= W; x += 40) {
        ctx.lineTo(x, y + Math.sin(x / 50 + timeRef.current / 25 + i) * 4)
      }

      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(120, 72, 30, 0.16)'

    for (let i = 0; i < 8; i++) {
      const x = i * 135 + 30
      const y = 185 + (i % 4) * 85

      ctx.beginPath()
      ctx.ellipse(x, y, 60, 14, -0.15, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = 'rgba(75, 55, 35, 0.24)'
    ctx.lineWidth = 2

    for (let i = 0; i < 18; i++) {
      const x = 40 + i * 54
      const y = 170 + ((i * 73) % 360)

      ctx.beginPath()
      ctx.ellipse(x, y, 8, 4, 0.5, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.ellipse(x + 12, y + 12, 8, 4, 0.5, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.fillStyle = 'rgba(20, 50, 35, 0.18)'
    ctx.save()
    ctx.translate(55, 115)
    ctx.rotate(-0.5)
    ctx.fillRect(0, 0, 24, 420)
    ctx.restore()
  }

  const drawItems = (ctx: CanvasRenderingContext2D) => {
    itemsRef.current.forEach((item) => {
      if (item.collected) return

      if (item.kind === 'shell') {
        ctx.fillStyle = '#fff7ed'
        ctx.beginPath()
        ctx.arc(item.x, item.y, 10, Math.PI, 0)
        ctx.lineTo(item.x + 10, item.y + 8)
        ctx.lineTo(item.x - 10, item.y + 8)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = '#fb923c'
        ctx.stroke()
      }

      if (item.kind === 'coconut') {
        ctx.fillStyle = '#7c3f14'
        ctx.beginPath()
        ctx.arc(item.x, item.y, 13, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#fef3c7'
        ctx.beginPath()
        ctx.arc(item.x - 4, item.y - 3, 2, 0, Math.PI * 2)
        ctx.arc(item.x + 3, item.y - 4, 2, 0, Math.PI * 2)
        ctx.fill()
      }

      if (item.kind === 'slipper') {
        ctx.fillStyle = '#ef4444'
        ctx.save()
        ctx.translate(item.x, item.y)
        ctx.rotate(-0.35)
        ctx.roundRect(-17, -7, 34, 14, 7)
        ctx.fill()

        ctx.strokeStyle = '#111827'
        ctx.beginPath()
        ctx.moveTo(-4, -4)
        ctx.lineTo(3, 2)
        ctx.lineTo(10, -4)
        ctx.stroke()
        ctx.restore()
      }
    })
  }

  const drawTurtle = (ctx: CanvasRenderingContext2D, t: Turtle) => {
    if (t.saved || t.lost || t.hatchDelay > 0) return

    ctx.save()
    ctx.translate(t.x, t.y)

    const wig = Math.sin(t.wiggle) * 3

    ctx.fillStyle = '#14532d'
    ctx.beginPath()
    ctx.ellipse(0, 0, t.size, t.size * 0.72, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(0, -t.size * 0.85, t.size * 0.35, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#16a34a'
    ctx.beginPath()
    ctx.ellipse(-t.size * 0.9, -2 + wig, 5, 3, -0.7, 0, Math.PI * 2)
    ctx.ellipse(t.size * 0.9, -2 - wig, 5, 3, 0.7, 0, Math.PI * 2)
    ctx.ellipse(-t.size * 0.65, t.size * 0.65 - wig, 4, 3, 0.7, 0, Math.PI * 2)
    ctx.ellipse(t.size * 0.65, t.size * 0.65 + wig, 4, 3, -0.7, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.35)'
    ctx.beginPath()
    ctx.moveTo(-t.size * 0.6, 0)
    ctx.lineTo(t.size * 0.6, 0)
    ctx.stroke()

    ctx.restore()
  }

  const drawCrab = (ctx: CanvasRenderingContext2D, c: Crab) => {
    ctx.save()
    ctx.translate(c.x, c.y)

    if (c.flipped) {
      ctx.rotate(Math.PI)

      ctx.fillStyle = '#fb923c'
      ctx.beginPath()
      ctx.ellipse(0, 0, c.size * 0.62, c.size * 0.43, 0, 0, Math.PI * 2)
      ctx.fill()

      const wig = Math.sin(c.legWiggle) * 7

      ctx.strokeStyle = '#fdba74'
      ctx.lineWidth = 3

      for (let i = -3; i <= 3; i++) {
        ctx.beginPath()
        ctx.moveTo(i * 5, 0)
        ctx.lineTo(i * 7, -18 - Math.abs(wig))
        ctx.stroke()
      }

      ctx.restore()

      ctx.save()
      ctx.translate(c.x, c.y - 28)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText('wiggle!', -22, 0)
      ctx.restore()

      return
    }

    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.ellipse(0, 0, c.size * 0.62, c.size * 0.43, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = '#b91c1c'
    ctx.lineWidth = 3

    for (let i = -3; i <= 3; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 5, 3)
      ctx.lineTo(i * 8, 16 + Math.sin(timeRef.current / 5 + i) * 3)
      ctx.stroke()
    }

    ctx.fillStyle = '#111827'
    ctx.beginPath()
    ctx.arc(-6, -5, 2, 0, Math.PI * 2)
    ctx.arc(6, -5, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const drawBird = (ctx: CanvasRenderingContext2D, b: Bird) => {
    if (b.state === 'warning') {
      ctx.fillStyle = 'rgba(0,0,0,0.28)'
      ctx.beginPath()
      ctx.ellipse(
        b.targetX,
        b.targetY + 8,
        34 + Math.sin(timeRef.current / 4) * 5,
        12,
        0,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    ctx.save()
    ctx.translate(b.x, b.y)

    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 4

    const flap = Math.sin(timeRef.current / 6 + b.id) * 10

    ctx.beginPath()
    ctx.moveTo(-22, 0)
    ctx.quadraticCurveTo(-8, -10 - flap, 0, 0)
    ctx.quadraticCurveTo(8, -10 + flap, 22, 0)
    ctx.stroke()

    ctx.restore()
  }

  const drawSeaLion = (ctx: CanvasRenderingContext2D, s: SeaLion) => {
    ctx.save()
    ctx.translate(s.x, s.y)

    ctx.fillStyle = '#57534e'
    ctx.beginPath()
    ctx.ellipse(s.w / 2, s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#78716c'
    ctx.beginPath()
    ctx.arc(s.w * 0.78, s.h * 0.25, 18, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#111827'
    ctx.beginPath()
    ctx.arc(s.w * 0.84, s.h * 0.2, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  const drawNest = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(92, 52, 23, 0.35)'
    ctx.beginPath()
    ctx.ellipse(500, NEST_Y + 16, 92, 32, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(70, 40, 20, 0.35)'
    ctx.stroke()
  }

  const drawWave = (ctx: CanvasRenderingContext2D) => {
    const wave = waveRef.current

    if (!wave.active) return

    ctx.fillStyle = 'rgba(191, 219, 254, 0.48)'
    ctx.beginPath()
    ctx.moveTo(0, wave.y - wave.height)

    for (let x = 0; x <= W; x += 30) {
      ctx.lineTo(
        x,
        wave.y - wave.height + Math.sin(x / 35 + timeRef.current / 8) * 9
      )
    }

    ctx.lineTo(W, wave.y + wave.height)
    ctx.lineTo(0, wave.y + wave.height)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.85)'
    ctx.lineWidth = 3
    ctx.beginPath()

    for (let x = 0; x <= W; x += 24) {
      const y =
        wave.y - wave.height + Math.sin(x / 35 + timeRef.current / 8) * 9

      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  const drawHud = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(7, 17, 31, 0.82)'
    ctx.roundRect(18, 18, W - 36, 78, 24)
    ctx.fill()

    ctx.strokeStyle = 'rgba(255,255,255,0.22)'
    ctx.stroke()

    ctx.fillStyle = '#fff7ed'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('🐢 Turtle Thankx', 38, 52)

    ctx.font = 'bold 17px sans-serif'
    ctx.fillText(`Score: ${score}`, 300, 52)
    ctx.fillText(`Saved: ${saved}/${TOTAL_TURTLES}`, 430, 52)
    ctx.fillText(`Lost: ${lost}`, 590, 52)

    ctx.font = '15px sans-serif'
    ctx.fillStyle = '#fed7aa'
    ctx.fillText(message, 38, 78)

    ctx.fillStyle = '#ffffff'
    ctx.fillText('Move: Arrow Keys / WASD    Speed burst: Space', 650, 78)
  }

  const drawStartOverlay = (ctx: CanvasRenderingContext2D) => {
    if (started) return

    ctx.fillStyle = 'rgba(0,0,0,0.48)'
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 42px sans-serif'
    ctx.fillText('Turtle Thankx', 355, 260)

    ctx.font = '19px sans-serif'
    ctx.fillText(
      'Guide the hatchlings past crabs, birds, sea lions, slippers, coconuts, and rogue waves.',
      190,
      300
    )
    ctx.fillText('Click Start Game below to begin.', 380, 332)
  }

  const draw = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, W, H)

    drawBackground(ctx)
    drawNest(ctx)
    drawItems(ctx)

    crabsRef.current.forEach((c) => drawCrab(ctx, c))
    seaLionsRef.current.forEach((s) => drawSeaLion(ctx, s))
    turtlesRef.current.forEach((t) => drawTurtle(ctx, t))
    birdsRef.current.forEach((b) => drawBird(ctx, b))

    drawWave(ctx)
    drawHud(ctx)
    drawStartOverlay(ctx)
  }

  return (
    <div className="min-h-screen bg-[#06111f] px-4 py-7 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 rounded-[30px] border border-orange-200/25 bg-white/5 p-5 shadow-2xl backdrop-blur">
          <h1 className="text-3xl font-black text-orange-100">
            Turtle Thankx
          </h1>

          <p className="mt-2 text-sm text-orange-50/90">
            Save the hatchlings. Dodge crabs, birds, sea lions, slippers, and
            rogue waves. Watch crabs flip upside down and wiggle back up.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={resetGame}
              className="rounded-2xl bg-orange-500 px-5 py-2 font-bold text-white shadow-lg transition hover:bg-orange-400"
            >
              Start Game
            </button>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm">
              Move: Arrow Keys / WASD
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm">
              Speed Burst: Space
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-orange-200/20 bg-black/30 shadow-[0_22px_70px_rgba(0,0,0,0.5)]">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="h-auto w-full bg-black"
          />
        </div>
      </div>
    </div>
  )
}