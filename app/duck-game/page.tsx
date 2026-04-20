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

const START_POS: Vec = { x: 178, y: 690 }

const DUCK_SIZE = 34
const DUCKLING_SIZE = 22

const POND_TOP = 28
const POND_HEIGHT = 100
const ROAD_TOP = 160
const ROAD_BOTTOM = 560

const LANES = [
  { y: 190, dir: 1 as 1 | -1, speed: 2.1 },
  { y: 250, dir: -1 as 1 | -1, speed: 2.7 },
  { y: 310, dir: 1 as 1 | -1, speed: 3.2 },
  { y: 370, dir: -1 as 1 | -1, speed: 3.8 },
  { y: 430, dir: 1 as 1 | -1, speed: 4.2 },
  { y: 490, dir: -1 as 1 | -1, speed: 4.8 },
]

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

function createDucklings(start: Vec): Vec[] {
  return [
    { x: start.x - 18, y: start.y + 16 },
    { x: start.x - 36, y: start.y + 32 },
    { x: start.x - 54, y: start.y + 48 },
    { x: start.x - 72, y: start.y + 64 },
    { x: start.x - 90, y: start.y + 80 },
  ]
}

export default function DuckGamePage() {
  const [score, setScore] = useState<number>(0)
  const [savedFamilies, setSavedFamilies] = useState<number>(0)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [winFlash, setWinFlash] = useState<boolean>(false)

  const [mamaPos, setMamaPos] = useState<Vec>(START_POS)
  const [ducklings, setDucklings] = useState<Vec[]>(createDucklings(START_POS))
  const [cars, setCars] = useState<Car[]>([])

  const mamaRef = useRef<Vec>(START_POS)
  const ducklingsRef = useRef<Vec[]>(createDucklings(START_POS))
  const carsRef = useRef<Car[]>([])
  const spawnTimerRef = useRef<number>(0)
  const animRef = useRef<number | null>(null)
  const carIdRef = useRef<number>(1)
  const lastTimeRef = useRef<number>(0)

  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  const mobileRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
  })

  const level = useMemo(() => {
    return Math.min(10, 1 + Math.floor(savedFamilies / 2))
  }, [savedFamilies])

  const moveSpeed = useMemo(() => {
    return 2.4 + level * 0.18
  }, [level])

  const spawnInterval = useMemo(() => {
    return Math.max(380, 1050 - level * 60)
  }, [level])

  const resetPositions = () => {
    const mama = { ...START_POS }
    const babies = createDucklings(START_POS)

    mamaRef.current = mama
    ducklingsRef.current = babies

    setMamaPos(mama)
    setDucklings(babies)
  }

  const restartGame = () => {
    setGameOver(false)
    setWinFlash(false)
    setScore(0)
    setSavedFamilies(0)
    setCars([])
    carsRef.current = []
    spawnTimerRef.current = 0
    carIdRef.current = 1
    lastTimeRef.current = 0
    resetPositions()
  }

  const spawnCar = () => {
    const lane = LANES[Math.floor(Math.random() * LANES.length)]
    const isTruck = Math.random() > 0.72
    const width = isTruck ? 76 : 58
    const height = isTruck ? 36 : 30

    const car: Car = {
      id: carIdRef.current++,
      x: lane.dir === 1 ? -width - 12 : GAME_WIDTH + 12,
      y: lane.y,
      width,
      height,
      speed: lane.speed + Math.random() * 1.8 + level * 0.25,
      direction: lane.dir,
      emoji: isTruck ? '🚚' : Math.random() > 0.5 ? '🚗' : '🚙',
    }

    carsRef.current = [...carsRef.current, car]
    setCars(carsRef.current)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'arrowup' || key === 'w') keysRef.current.up = true
      if (key === 'arrowdown' || key === 's') keysRef.current.down = true
      if (key === 'arrowleft' || key === 'a') keysRef.current.left = true
      if (key === 'arrowright' || key === 'd') keysRef.current.right = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if (key === 'arrowup' || key === 'w') keysRef.current.up = false
      if (key === 'arrowdown' || key === 's') keysRef.current.down = false
      if (key === 'arrowleft' || key === 'a') keysRef.current.left = false
      if (key === 'arrowright' || key === 'd') keysRef.current.right = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const loop = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const delta = Math.min(32, time - lastTimeRef.current)
      lastTimeRef.current = time

      if (!gameOver) {
        const up = keysRef.current.up || mobileRef.current.up
        const down = keysRef.current.down || mobileRef.current.down
        const left = keysRef.current.left || mobileRef.current.left
        const right = keysRef.current.right || mobileRef.current.right

        let dx = 0
        let dy = 0

        if (up) dy -= moveSpeed
        if (down) dy += moveSpeed
        if (left) dx -= moveSpeed
        if (right) dx += moveSpeed

        if (dx !== 0 && dy !== 0) {
          dx *= 0.72
          dy *= 0.72
        }

        const nextMama: Vec = {
          x: clamp(mamaRef.current.x + dx, 8, GAME_WIDTH - DUCK_SIZE - 8),
          y: clamp(mamaRef.current.y + dy, 8, GAME_HEIGHT - DUCK_SIZE - 8),
        }

        mamaRef.current = nextMama

        const nextDucklings = ducklingsRef.current.map((duck, index) => {
          const leader = index === 0 ? nextMama : ducklingsRef.current[index - 1]
          return {
            x: duck.x + (leader.x - duck.x) * 0.14,
            y: duck.y + (leader.y - duck.y) * 0.14,
          }
        })

        ducklingsRef.current = nextDucklings

        spawnTimerRef.current += delta
        if (spawnTimerRef.current >= spawnInterval) {
          spawnTimerRef.current = 0
          spawnCar()
        }

        const movedCars = carsRef.current
          .map((car) => ({
            ...car,
            x: car.x + car.speed * car.direction,
          }))
          .filter((car) => car.x > -170 && car.x < GAME_WIDTH + 170)

        carsRef.current = movedCars

        const mamaHitbox = {
          x: nextMama.x + 6,
          y: nextMama.y + 8,
          width: 22,
          height: 20,
        }

        const hit = movedCars.some((car) =>
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

          setTimeout(() => {
            resetPositions()
            setWinFlash(false)
          }, 280)
        }

        setMamaPos({ ...nextMama })
        setDucklings([...nextDucklings])
        setCars([...movedCars])
      }

      animRef.current = window.requestAnimationFrame(loop)
    }

    animRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (animRef.current !== null) {
        window.cancelAnimationFrame(animRef.current)
      }
    }
  }, [gameOver, moveSpeed, spawnInterval])

  const press = (dir: 'up' | 'down' | 'left' | 'right', value: boolean) => {
    mobileRef.current[dir] = value
  }

  const buttonClass =
    'flex h-16 w-16 select-none items-center justify-center rounded-2xl border border-orange-200 bg-white/90 text-2xl shadow-[0_10px_25px_rgba(255,145,90,0.18)] active:scale-95'

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7ef_0%,#ffe9d8_40%,#ffd9c2_100%)] px-3 py-4 text-[#402316]">
      <div className="mx-auto flex max-w-[430px] flex-col items-center">
        <div className="mb-3 w-full rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_18px_45px_rgba(255,140,90,0.18)] backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                🦆 Duck Pond Dash
              </h1>
              <p className="mt-1 text-sm text-[#7b4a34]">
                Help mama duck guide the babies across the busy road into the
                pond.
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
              <div className="text-xs uppercase tracking-wide text-[#9c6b55]">
                Score
              </div>
              <div className="text-xl font-extrabold">{score}</div>
            </div>

            <div className="rounded-2xl bg-[#fff4ee] p-3">
              <div className="text-xs uppercase tracking-wide text-[#9c6b55]">
                Saved
              </div>
              <div className="text-xl font-extrabold">{savedFamilies}</div>
            </div>

            <div className="rounded-2xl bg-[#fff4ee] p-3">
              <div className="text-xs uppercase tracking-wide text-[#9c6b55]">
                Level
              </div>
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
          <div className="absolute inset-0 bg-[#f4ddb4]" />

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

          <div className="absolute left-0 right-0 top-[128px] h-10 bg-[#88c56a]" />

          <div
            className="absolute left-0 right-0 bg-[#404756]"
            style={{ top: ROAD_TOP, height: ROAD_BOTTOM - ROAD_TOP }}
          >
            {LANES.map((lane, index) => (
              <div
                key={index}
                className="absolute left-0 right-0"
                style={{ top: lane.y - ROAD_TOP + 15, height: 2 }}
              >
                <div className="h-[2px] w-full bg-[repeating-linear-gradient(90deg,#fde68a_0_26px,transparent_26px_44px)] opacity-85" />
              </div>
            ))}
          </div>

          <div className="absolute left-0 right-0 bottom-0 h-[170px] bg-[#88c56a]" />

          <div className="absolute left-4 top-[135px] text-lg">🌼</div>
          <div className="absolute right-4 top-[135px] text-lg">🌼</div>
          <div className="absolute left-6 bottom-20 text-xl">🌿</div>
          <div className="absolute right-8 bottom-24 text-xl">🌼</div>

          <div className="absolute left-1/2 bottom-12 -translate-x-1/2 text-sm font-bold text-[#5b3a22]">
            Start here
          </div>

          {cars.map((car) => (
            <div
              key={car.id}
              className="absolute flex items-center justify-center"
              style={{
                left: car.x,
                top: car.y,
                width: car.width,
                height: car.height,
                fontSize: car.width > 60 ? 36 : 28,
                transform: car.direction === -1 ? 'scaleX(-1)' : 'none',
              }}
            >
              {car.emoji}
            </div>
          ))}

          {ducklings.map((duck, index) => (
            <div
              key={index}
              className="absolute flex items-center justify-center"
              style={{
                left: duck.x,
                top: duck.y,
                width: DUCKLING_SIZE,
                height: DUCKLING_SIZE,
                fontSize: 18,
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
            }}
          >
            🦆
          </div>

          {winFlash && !gameOver && (
            <div className="pointer-events-none absolute left-1/2 top-[112px] -translate-x-1/2 rounded-full bg-white/85 px-4 py-2 text-sm font-extrabold text-[#2563eb] shadow-lg">
              Family saved! 🎉
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/35 p-6">
              <div className="w-full rounded-[28px] border border-white/30 bg-white/90 p-5 text-center shadow-2xl backdrop-blur">
                <div className="text-4xl">💥</div>
                <h2 className="mt-2 text-2xl font-extrabold">Duck down!</h2>
                <p className="mt-2 text-sm text-[#7b4a34]">
                  Traffic was too wild. Tap below and try again.
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
        </div>

        <div className="mt-4 w-full rounded-[28px] border border-white/60 bg-white/75 p-4 shadow-[0_18px_45px_rgba(255,140,90,0.16)] backdrop-blur">
          <div className="mb-3 text-center text-sm font-semibold text-[#7b4a34]">
            Mobile controls
          </div>

          <div className="mx-auto grid w-[220px] grid-cols-3 gap-3">
            <div />

            <button
              className={buttonClass}
              onPointerDown={() => press('up', true)}
              onPointerUp={() => press('up', false)}
              onPointerLeave={() => press('up', false)}
              onTouchEnd={() => press('up', false)}
            >
              ⬆️
            </button>

            <div />

            <button
              className={buttonClass}
              onPointerDown={() => press('left', true)}
              onPointerUp={() => press('left', false)}
              onPointerLeave={() => press('left', false)}
              onTouchEnd={() => press('left', false)}
            >
              ⬅️
            </button>

            <button
              className={buttonClass}
              onPointerDown={() => press('down', true)}
              onPointerUp={() => press('down', false)}
              onPointerLeave={() => press('down', false)}
              onTouchEnd={() => press('down', false)}
            >
              ⬇️
            </button>

            <button
              className={buttonClass}
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