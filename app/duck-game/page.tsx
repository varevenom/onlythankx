'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type Vec = {
  x: number
  y: number
}

type Car = {
  id: number
  x: number
  y: number
  width: number
  height: number
  speed: number
  direction: 1 | -1
  emoji: string
}

const GAME_WIDTH = 390
const GAME_HEIGHT = 780

const START_POS = { x: 190, y: 700 }
const DUCK_SIZE = 34
const DUCKLING_SIZE = 22

const ROAD_TOP = 170
const ROAD_BOTTOM = 560
const POND_TOP = 36
const POND_HEIGHT = 90

const LANES = [
  { y: 205, dir: 1, speed: 2.2 },
  { y: 265, dir: -1, speed: 2.8 },
  { y: 325, dir: 1, speed: 3.4 },
  { y: 385, dir: -1, speed: 3.8 },
  { y: 445, dir: 1, speed: 4.4 },
  { y: 505, dir: -1, speed: 5.0 },
]

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

const rectsOverlap = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export default function DuckGamePage() {
  const [mounted, setMounted] = useState(false)
  const [score, setScore] = useState(0)
  const [savedFamilies, setSavedFamilies] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [winFlash, setWinFlash] = useState(false)

  const [mamaPos, setMamaPos] = useState<Vec>(START_POS)
  const [ducklings, setDucklings] = useState<Vec[]>([
    { x: START_POS.x - 18, y: START_POS.y + 20 },
    { x: START_POS.x - 36, y: START_POS.y + 36 },
    { x: START_POS.x - 54, y: START_POS.y + 52 },
  ])
  const [cars, setCars] = useState<Car[]>([])

  const mamaRef = useRef<Vec>(START_POS)
  const ducklingsRef = useRef<Vec[]>([
    { x: START_POS.x - 18, y: START_POS.y + 20 },
    { x: START_POS.x - 36, y: START_POS.y + 36 },
    { x: START_POS.x - 54, y: START_POS.y + 52 },
  ])
  const carsRef = useRef<Car[]>([])

  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  const pointerRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  const animationRef = useRef<number | null>(null)
  const spawnRef = useRef<number>(0)
  const carIdRef = useRef(1)
  const lastTimeRef = useRef<number>(0)

  const level = useMemo(() => {
    return Math.min(10, 1 + Math.floor(savedFamilies / 2))
  }, [savedFamilies])

  const currentSpeed = useMemo(() => {
    return 2.5 + level * 0.22
  }, [level])

  const spawnInterval = useMemo(() => {
    return Math.max(420, 1000 - level * 55)
  }, [level])

  useEffect(() => {
    setMounted(true)
  }, [])

  const resetPositions = () => {
    const newMama = { ...START_POS }
    const newDucklings = [
      { x: START_POS.x - 18, y: START_POS.y + 20 },
      { x: START_POS.x - 36, y: START_POS.y + 36 },
      { x: START_POS.x - 54, y: START_POS.y + 52 },
    ]

    mamaRef.current = newMama
    ducklingsRef.current = newDucklings
    setMamaPos(newMama)
    setDucklings(newDucklings)
  }

  const restartGame = () => {
    setGameOver(false)
    setScore(0)
    setSavedFamilies(0)
    setWinFlash(false)
    setCars([])
    carsRef.current = []
    carIdRef.current = 1
    spawnRef.current = 0
    resetPositions()
  }

  const spawnCar = () => {
    const lane = LANES[Math.floor(Math.random() * LANES.length)]
    const isBig = Math.random() > 0.72
    const width = isBig ? 72 : 56
    const height = isBig ? 34 : 30
    const emoji = isBig ? '🚚' : Math.random() > 0.5 ? '🚗' : '🚙'

    const car: Car = {
      id: carIdRef.current++,
      x: lane.dir === 1 ? -width - 10 : GAME_WIDTH + 10,
      y: lane.y,
      width,
      height,
      speed: lane.speed + Math.random() * 1.1 + level * 0.12,
      direction: lane.dir as 1 | -1,
      emoji,
    }

    carsRef.current = [...carsRef.current, car]
    setCars(carsRef.current)
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') keysRef.current.up = true
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') keysRef.current.down = true
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keysRef.current.left = true
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keysRef.current.right = true
    }

    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') keysRef.current.up = false
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') keysRef.current.down = false
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keysRef.current.left = false
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keysRef.current.right = false
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const delta = Math.min(32, time - lastTimeRef.current)
      lastTimeRef.current = time

      if (!gameOver) {
        const inputUp = keysRef.current.up || pointerRef.current.up
        const inputDown = keysRef.current.down || pointerRef.current.down
        const inputLeft = keysRef.current.left || pointerRef.current.left
        const inputRight = keysRef.current.right || pointerRef.current.right

        let dx = 0
        let dy = 0

        if (inputUp) dy -= currentSpeed
        if (inputDown) dy += currentSpeed
        if (inputLeft) dx -= currentSpeed
        if (inputRight) dx += currentSpeed

        if (dx !== 0 && dy !== 0) {
          dx *= 0.72
          dy *= 0.72
        }

        const nextMama = {
          x: clamp(mamaRef.current.x + dx, 6, GAME_WIDTH - DUCK_SIZE - 6),
          y: clamp(mamaRef.current.y + dy, 6, GAME_HEIGHT - DUCK_SIZE - 6),
        }

        mamaRef.current = nextMama

        const nextDucklings = ducklingsRef.current.map((duck, i) => {
          const leader = i === 0 ? mamaRef.current : ducklingsRef.current[i - 1]
          return {
            x: duck.x + (leader.x - duck.x) * 0.13,
            y: duck.y + (leader.y - duck.y) * 0.13,
          }
        })

        ducklingsRef.current = nextDucklings

        spawnRef.current += delta
        if (spawnRef.current >= spawnInterval) {
          spawnRef.current = 0
          spawnCar()
        }

        const updatedCars = carsRef.current
          .map((car) => ({
            ...car,
            x: car.x + car.speed * car.direction,
          }))
          .filter((car) => car.x > -160 && car.x < GAME_WIDTH + 160)

        carsRef.current = updatedCars

        const mamaHitbox = {
          x: nextMama.x + 6,
          y: nextMama.y + 8,
          width: 22,
          height: 20,
        }

        const hit = updatedCars.some((car) =>
          rectsOverlap(mamaHitbox, {
            x: car.x,
            y: car.y,
            width: car.width,
            height: car.height,
          })
        )

        if (hit) {
          setGameOver(true)
        }

        if (nextMama.y <= POND_TOP + POND_HEIGHT - 18) {
          setScore((prev) => prev + 100)
          setSavedFamilies((prev) => prev + 1)
          setWinFlash(true)
          resetPositions()
          setTimeout(() => setWinFlash(false), 450)
        }

        setMamaPos({ ...mamaRef.current })
        setDucklings([...ducklingsRef.current])
        setCars([...carsRef.current])
      }

      animationRef.current = requestAnimationFrame(loop)
    }

    animationRef.current = requestAnimationFrame(loop)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [mounted, gameOver, currentSpeed, spawnInterval])

  const press = (dir: 'up' | 'down' | 'left' | 'right', value: boolean) => {
    pointerRef.current[dir] = value
  }

  const buttonBase =
    'select-none flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-200 bg-white/90 text-2xl shadow-[0_10px_25px_rgba(255,145,90,0.18)] active:scale-95'

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ef_0%,#ffe7d6_45%,#ffd6bd_100%)] px-3 py-4 text-[#402316]">
      <div className="mx-auto flex max-w-[430px] flex-col items-center">
        <div className="mb-3 w-full rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_18px_45px_rgba(255,140,90,0.18)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                🦆 Duck Pond Dash
              </h1>
              <p className="mt-1 text-sm text-[#7b4a34]">
                Help mama duck guide the babies across the wild road into the pond.
              </p>
            </div>
            <button
              onClick={restartGame}
              className="rounded-2xl bg-[#ff8f5a] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,143,90,0.35)] active:scale-95"
            >
              Restart
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-[#fff4ee] p-3">
              <div className="text-xs uppercase tracking-wide text-[#9c6b55]">Score</div>
              <div className="text-xl font-extrabold">{score}</div>
            </div>
            <div className="rounded-2xl bg-[#fff4ee] p-3">
              <div className="text-xs uppercase tracking-wide text-[#9c6b55]">Saved</div>
              <div className="text-xl font-extrabold">{savedFamilies}</div>
            </div>
            <div className="rounded-2xl bg-[#fff4ee] p-3">
              <div className="text-xs uppercase tracking-wide text-[#9c6b55]">Level</div>
              <div className="text-xl font-extrabold">{level}</div>
            </div>
          </div>
        </div>

        <div
          className={`relative w-full overflow-hidden rounded-[34px] border-4 border-white/70 shadow-[0_30px_70px_rgba(100,40,10,0.18)] ${
            winFlash ? 'ring-4 ring-yellow-300' : ''
          }`}
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        >
          <div className="absolute inset-0 bg-[#f8d9ac]" />

          <div
            className="absolute left-0 right-0 rounded-b-[26px] border-b-4 border-blue-300 bg-[linear-gradient(180deg,#7dd3fc_0%,#38bdf8_100%)]"
            style={{ top: POND_TOP, height: POND_HEIGHT }}
          >
            <div className="absolute left-5 top-4 text-2xl">🪷</div>
            <div className="absolute right-8 top-5 text-2xl">🌿</div>
            <div className="absolute left-1/2 top-6 -translate-x-1/2 text-xs font-bold text-white">
              SAFE POND
            </div>
          </div>

          <div
            className="absolute left-0 right-0 bg-[#4b5563]"
            style={{ top: ROAD_TOP, height: ROAD_BOTTOM - ROAD_TOP }}
          >
            {LANES.map((lane, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-white/10"
                style={{ top: lane.y - ROAD_TOP + 15, height: 2 }}
              >
                <div className="mt-0.5 h-[2px] w-full bg-[repeating-linear-gradient(90deg,#fde68a_0_26px,transparent_26px_42px)] opacity-80" />
              </div>
            ))}
          </div>

          <div className="absolute left-0 right-0 top-[125px] h-10 bg-[#88c56a]" />
          <div className="absolute left-0 right-0 bottom-0 h-[165px] bg-[#88c56a]" />

          <div className="absolute left-4 top-[132px] text-lg">🌼</div>
          <div className="absolute right-4 top-[132px] text-lg">🌼</div>
          <div className="absolute left-6 bottom-20 text-xl">🌿</div>
          <div className="absolute right-8 bottom-24 text-xl">🌼</div>
          <div className="absolute left-1/2 bottom-10 -translate-x-1/2 text-sm font-bold text-[#5b3a22]">
            Start here
          </div>

          {cars.map((car) => (
            <div
              key={car.id}
              className="absolute flex items-center justify-center rounded-xl"
              style={{
                left: car.x,
                top: car.y,
                width: car.width,
                height: car.height,
                fontSize: car.width > 60 ? 28 : 24,
                transform: car.direction === -1 ? 'scaleX(-1)' : 'none',
              }}
            >
              {car.emoji}
            </div>
          ))}

          {ducklings.map((duck, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center"
              style={{
                left: duck.x,
                top: duck.y,
                width: DUCKLING_SIZE,
                height: DUCKLING_SIZE,
                fontSize: 18,
                transition: 'transform 40ms linear',
              }}
            >
              🐥
            </div>
          ))}

          <div
            className="absolute flex items-center justify-center"
            style={{
              left: mamaPos.x,
              top: mamaPos.y,
              width: DUCK_SIZE,
              height: DUCK_SIZE,
              fontSize: 28,
              transition: 'transform 40ms linear',
            }}
          >
            🦆
          </div>

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 p-6">
              <div className="w-full rounded-[28px] border border-white/30 bg-white/90 p-5 text-center shadow-2xl backdrop-blur">
                <div className="text-4xl">💥</div>
                <h2 className="mt-2 text-2xl font-extrabold">Duck down!</h2>
                <p className="mt-2 text-sm text-[#7b4a34]">
                  Traffic was too spicy. Let’s try that crossing again.
                </p>
                <button
                  onClick={restartGame}
                  className="mt-4 rounded-2xl bg-[#ff8f5a] px-5 py-3 font-bold text-white shadow-[0_12px_28px_rgba(255,143,90,0.35)] active:scale-95"
                >
                  Play again
                </button>
              </div>
            </div>
          )}

          {winFlash && !gameOver && (
            <div className="pointer-events-none absolute left-1/2 top-[110px] -translate-x-1/2 rounded-full bg-white/80 px-4 py-2 text-sm font-extrabold text-[#2563eb] shadow-lg">
              Family saved! 🎉
            </div>
          )}
        </div>

        <div className="mt-4 w-full rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_18px_45px_rgba(255,140,90,0.16)] backdrop-blur">
          <div className="mb-3 text-center text-sm font-semibold text-[#7b4a34]">
            Mobile controls
          </div>

          <div className="mx-auto grid w-[220px] grid-cols-3 gap-3">
            <div />
            <button
              className={buttonBase}
              onPointerDown={() => press('up', true)}
              onPointerUp={() => press('up', false)}
              onPointerLeave={() => press('up', false)}
              onTouchEnd={() => press('up', false)}
            >
              ⬆️
            </button>
            <div />

            <button
              className={buttonBase}
              onPointerDown={() => press('left', true)}
              onPointerUp={() => press('left', false)}
              onPointerLeave={() => press('left', false)}
              onTouchEnd={() => press('left', false)}
            >
              ⬅️
            </button>

            <button
              className={buttonBase}
              onPointerDown={() => press('down', true)}
              onPointerUp={() => press('down', false)}
              onPointerLeave={() => press('down', false)}
              onTouchEnd={() => press('down', false)}
            >
              ⬇️
            </button>

            <button
              className={buttonBase}
              onPointerDown={() => press('right', true)}
              onPointerUp={() => press('right', false)}
              onPointerLeave={() => press('right', false)}
              onTouchEnd={() => press('right', false)}
            >
              ➡️
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-[#8d614c]">
            Desktop also works with arrow keys or WASD.
          </p>
        </div>
      </div>
    </main>
  )
}