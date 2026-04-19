'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ProductId = 'cookies' | 'candles' | 'cakes' | 'cupcakes' | 'honeybun' | 'candy'
type CharacterId = 'teenboy' | 'teengirl' | 'man' | 'woman'
type GameMode = 'normal' | 'busy'

type Product = {
  id: ProductId
  name: string
  price: number
  color: string
  emoji: string
}

type Shelf = {
  id: string
  x: number
  y: number
  w: number
  h: number
  productId: ProductId
  stock: number
}

type CartItem = {
  productId: ProductId
  qty: number
}

type Goal = {
  productId: ProductId
  qty: number
}

type FloatingText = {
  id: number
  x: number
  y: number
  text: string
}

type Npc = {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  color: string
}

type LevelConfig = {
  level: number
  label: string
  budget: number
  time: number
  playerSpeed: number
  npcCount: number
  npcSpeed: number
  scoreBonus: number
  goals: Goal[]
}

const GRID_W = 1380
const GRID_H = 900
const PLAYER_W = 34
const PLAYER_H = 72
const NPC_W = 30
const NPC_H = 64
const MOBILE_BREAKPOINT = 768
const INTERACT_DISTANCE = 95

const PRODUCTS: Record<ProductId, Product> = {
  cookies: { id: 'cookies', name: 'Cookies', color: '#f59e0b', emoji: '🍪' },
  candles: { id: 'candles', name: 'Candles', color: '#a3a3a3', emoji: '🕯️' },
  cakes: { id: 'cakes', name: 'Cakes', color: '#fb7185', emoji: '🎂' },
  cupcakes: { id: 'cupcakes', name: 'Cupcakes', color: '#ec4899', emoji: '🧁' },
  honeybun: { id: 'honeybun', name: 'Honey Bun', color: '#eab308', emoji: '🍯' },
  candy: { id: 'candy', name: 'Candy', color: '#38bdf8', emoji: '🍬' },
}

const PRODUCT_PRICES: Record<ProductId, number> = {
  cookies: 8.5,
  candles: 7.99,
  cakes: 11.99,
  cupcakes: 4.29,
  honeybun: 2.99,
  candy: 3.49,
}

const CHARACTERS: Record<CharacterId, { label: string; shirt: string; pants: string; hair: string }> = {
  teenboy: { label: 'Teen Boy', shirt: '#2563eb', pants: '#111827', hair: '#3f3f46' },
  teengirl: { label: 'Teen Girl', shirt: '#ec4899', pants: '#1f2937', hair: '#7c2d12' },
  man: { label: 'Man', shirt: '#16a34a', pants: '#1f2937', hair: '#111827' },
  woman: { label: 'Woman', shirt: '#f97316', pants: '#1f2937', hair: '#4b5563' },
}

const MODE_INFO: Record<GameMode, { label: string; description: string }> = {
  normal: {
    label: 'Normal Mode',
    description: 'Just shop and checkout.',
  },
  busy: {
    label: 'Busy Store Mode',
    description: 'Crowded aisles, moving customers, more pressure, more points.',
  },
}

const LEVELS: LevelConfig[] = [
  {
    level: 1,
    label: 'Warm Up Run',
    budget: 25,
    time: 95,
    playerSpeed: 10,
    npcCount: 0,
    npcSpeed: 0,
    scoreBonus: 50,
    goals: [
      { productId: 'cookies', qty: 1 },
      { productId: 'cupcakes', qty: 1 },
    ],
  },
  {
    level: 2,
    label: 'Small Basket',
    budget: 28,
    time: 90,
    playerSpeed: 10.5,
    npcCount: 1,
    npcSpeed: 1.3,
    scoreBonus: 70,
    goals: [
      { productId: 'cookies', qty: 1 },
      { productId: 'cupcakes', qty: 1 },
      { productId: 'honeybun', qty: 1 },
    ],
  },
  {
    level: 3,
    label: 'Aisle Hustle',
    budget: 30,
    time: 85,
    playerSpeed: 11,
    npcCount: 2,
    npcSpeed: 1.5,
    scoreBonus: 90,
    goals: [
      { productId: 'cookies', qty: 1 },
      { productId: 'cupcakes', qty: 1 },
      { productId: 'honeybun', qty: 1 },
      { productId: 'candy', qty: 1 },
    ],
  },
  {
    level: 4,
    label: 'Sweet Pressure',
    budget: 32,
    time: 82,
    playerSpeed: 11,
    npcCount: 3,
    npcSpeed: 1.8,
    scoreBonus: 110,
    goals: [
      { productId: 'cookies', qty: 1 },
      { productId: 'cakes', qty: 1 },
      { productId: 'cupcakes', qty: 1 },
      { productId: 'honeybun', qty: 1 },
    ],
  },
  {
    level: 5,
    label: 'Lunch Rush',
    budget: 34,
    time: 80,
    playerSpeed: 11.5,
    npcCount: 4,
    npcSpeed: 2,
    scoreBonus: 130,
    goals: [
      { productId: 'cookies', qty: 1 },
      { productId: 'cakes', qty: 1 },
      { productId: 'cupcakes', qty: 2 },
      { productId: 'honeybun', qty: 1 },
    ],
  },
  {
    level: 6,
    label: 'Crowded Carts',
    budget: 36,
    time: 76,
    playerSpeed: 11.5,
    npcCount: 5,
    npcSpeed: 2.2,
    scoreBonus: 150,
    goals: [
      { productId: 'cookies', qty: 1 },
      { productId: 'candles', qty: 1 },
      { productId: 'cakes', qty: 1 },
      { productId: 'cupcakes', qty: 2 },
    ],
  },
  {
    level: 7,
    label: 'Store Sprint',
    budget: 38,
    time: 73,
    playerSpeed: 12,
    npcCount: 6,
    npcSpeed: 2.3,
    scoreBonus: 180,
    goals: [
      { productId: 'cookies', qty: 2 },
      { productId: 'candles', qty: 1 },
      { productId: 'cakes', qty: 1 },
      { productId: 'honeybun', qty: 1 },
    ],
  },
  {
    level: 8,
    label: 'Rush Hour',
    budget: 40,
    time: 70,
    playerSpeed: 12.3,
    npcCount: 7,
    npcSpeed: 2.4,
    scoreBonus: 210,
    goals: [
      { productId: 'cookies', qty: 2 },
      { productId: 'candles', qty: 1 },
      { productId: 'cakes', qty: 1 },
      { productId: 'cupcakes', qty: 2 },
      { productId: 'candy', qty: 1 },
    ],
  },
  {
    level: 9,
    label: 'Chaos Checkout',
    budget: 42,
    time: 66,
    playerSpeed: 12.6,
    npcCount: 8,
    npcSpeed: 2.6,
    scoreBonus: 250,
    goals: [
      { productId: 'cookies', qty: 2 },
      { productId: 'candles', qty: 1 },
      { productId: 'cakes', qty: 1 },
      { productId: 'cupcakes', qty: 2 },
      { productId: 'honeybun', qty: 1 },
      { productId: 'candy', qty: 1 },
    ],
  },
  {
    level: 10,
    label: 'Thankx Mart Legend',
    budget: 45,
    time: 62,
    playerSpeed: 13,
    npcCount: 9,
    npcSpeed: 2.8,
    scoreBonus: 320,
    goals: [
      { productId: 'cookies', qty: 2 },
      { productId: 'candles', qty: 1 },
      { productId: 'cakes', qty: 1 },
      { productId: 'cupcakes', qty: 2 },
      { productId: 'honeybun', qty: 2 },
      { productId: 'candy', qty: 2 },
    ],
  },
]

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function overlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function distanceBetweenCenters(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number }
) {
  const ax = a.x + a.w / 2
  const ay = a.y + a.h / 2
  const bx = b.x + b.w / 2
  const by = b.y + b.h / 2
  return Math.hypot(ax - bx, ay - by)
}

function randomNpcColor(index: number) {
  const colors = ['#64748b', '#334155', '#0f766e', '#7c3aed', '#dc2626', '#0369a1']
  return colors[index % colors.length]
}

function createShelvesForLevel(level: number): Shelf[] {
  const extra = Math.min(2, Math.floor((level - 1) / 4))

  return [
    { id: 's1', x: 520, y: 110, w: 155, h: 110, productId: 'cookies', stock: 6 + extra },
    { id: 's2', x: 760, y: 110, w: 155, h: 110, productId: 'candles', stock: 5 + extra },
    { id: 's3', x: 1000, y: 110, w: 155, h: 110, productId: 'cakes', stock: 4 + extra },
    { id: 's4', x: 520, y: 500, w: 155, h: 110, productId: 'cupcakes', stock: 7 + extra },
    { id: 's5', x: 760, y: 500, w: 155, h: 110, productId: 'honeybun', stock: 6 + extra },
    { id: 's6', x: 1000, y: 500, w: 155, h: 110, productId: 'candy', stock: 8 + extra },
  ]
}

function createNpcs(count: number, speed: number): Npc[] {
  return Array.from({ length: count }).map((_, i) => {
    const row = i % 4
    const yPositions = [275, 360, 700, 790]
    const dirs = i % 2 === 0 ? 1 : -1
    return {
      id: `npc-${i}`,
      x: dirs === 1 ? 250 + i * 40 : 1120 - i * 35,
      y: yPositions[row],
      vx: dirs * speed,
      vy: 0,
      color: randomNpcColor(i),
    }
  })
}

function HumanFigure({
  x,
  y,
  facing,
  walking,
  shirt,
  pants,
  hair,
  cameraX,
  cameraY,
  width = PLAYER_W,
  height = PLAYER_H,
}: {
  x: number
  y: number
  facing: 'left' | 'right'
  walking: boolean
  shirt: string
  pants: string
  hair: string
  cameraX: number
  cameraY: number
  width?: number
  height?: number
}) {
  const bob = walking ? 2 : 0
  const headSize = Math.round(width * 0.56)
  const bodyW = Math.round(width * 0.5)
  const bodyH = Math.round(height * 0.34)
  const legH = Math.round(height * 0.28)
  const armH = Math.round(height * 0.24)
  const armAngle = walking ? (facing === 'right' ? 18 : -18) : 6
  const legAngle = walking ? 18 : 4

  return (
    <div
      style={{
        position: 'absolute',
        left: x - cameraX,
        top: y - cameraY + bob,
        width,
        height,
        transform: facing === 'left' ? 'scaleX(-1)' : 'none',
        transformOrigin: 'center center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: (width - headSize) / 2,
          top: 0,
          width: headSize,
          height: headSize,
          borderRadius: '999px',
          background: '#f5c88f',
          border: '2px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '42%',
            background: hair,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          left: (width - bodyW) / 2,
          top: headSize - 2,
          width: bodyW,
          height: bodyH,
          borderRadius: 10,
          background: shirt,
          border: '2px solid rgba(0,0,0,0.08)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: width / 2 - bodyW / 2 - 8,
          top: headSize + 8,
          width: 8,
          height: armH,
          background: shirt,
          borderRadius: 999,
          transform: `rotate(${armAngle}deg)`,
          transformOrigin: 'top center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: width / 2 - bodyW / 2 - 8,
          top: headSize + 8,
          width: 8,
          height: armH,
          background: shirt,
          borderRadius: 999,
          transform: `rotate(${-armAngle}deg)`,
          transformOrigin: 'top center',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: width / 2 - 10,
          top: headSize + bodyH - 2,
          width: 8,
          height: legH,
          background: pants,
          borderRadius: 999,
          transform: `rotate(${legAngle}deg)`,
          transformOrigin: 'top center',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: width / 2 + 2,
          top: headSize + bodyH - 2,
          width: 8,
          height: legH,
          background: pants,
          borderRadius: 999,
          transform: `rotate(${-legAngle}deg)`,
          transformOrigin: 'top center',
        }}
      />
    </div>
  )
}

export default function ThankxMartPage() {
  const entranceZone = { x: 35, y: 650, w: 145, h: 155 }
  const exitZone = { x: 35, y: 45, w: 145, h: 155 }
  const cartZone = { x: 230, y: 655, w: 130, h: 92 }
  const checkoutZone = { x: 220, y: 165, w: 185, h: 160 }
  const verifierZone = { x: 245, y: 55, w: 120, h: 78 }

  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>(null)
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal')
  const [levelIndex, setLevelIndex] = useState(0)

  const currentLevel = LEVELS[levelIndex]

  const [player, setPlayer] = useState({ x: 95, y: 700 })
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [facing, setFacing] = useState<'left' | 'right'>('right')
  const [isMoving, setIsMoving] = useState(false)

  const [camera, setCamera] = useState({ x: 0, y: 0 })
  const [cartPos, setCartPos] = useState({ x: 68, y: 710 })
  const [hasCart, setHasCart] = useState(false)

  const [budget, setBudget] = useState(currentLevel.budget)
  const [timeLeft, setTimeLeft] = useState(currentLevel.time)
  const [score, setScore] = useState(0)
  const [gracePoints, setGracePoints] = useState(0)
  const [npcBumps, setNpcBumps] = useState(0)

  const [message, setMessage] = useState('Choose your shopper and mode.')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [receiptChecked, setReceiptChecked] = useState(false)

  const [shelves, setShelves] = useState<Shelf[]>(createShelvesForLevel(currentLevel.level))
  const [cart, setCart] = useState<CartItem[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [npcs, setNpcs] = useState<Npc[]>(createNpcs(currentLevel.npcCount, currentLevel.npcSpeed))

  const boardScrollRef = useRef<HTMLDivElement | null>(null)
  const pressedKeys = useRef<Record<string, boolean>>({})

  const goals = currentLevel.goals

  const totalSpent = useMemo(
    () => cart.reduce((sum, item) => sum + PRODUCT_PRICES[item.productId] * item.qty, 0),
    [cart]
  )

  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart])

  const objectiveProgress = useMemo(() => {
    return goals.map((goal) => {
      const found = cart.find((item) => item.productId === goal.productId)?.qty ?? 0
      return { ...goal, found, done: found >= goal.qty }
    })
  }, [cart, goals])

  const allGoalsMet = objectiveProgress.every((goal) => goal.done)

  const activeNpcCount = selectedMode === 'busy' ? currentLevel.npcCount : 0
  const activeNpcSpeed = selectedMode === 'busy' ? currentLevel.npcSpeed : 0

  useEffect(() => {
    setBudget(currentLevel.budget)
    setTimeLeft(currentLevel.time)
    setShelves(createShelvesForLevel(currentLevel.level))
    setNpcs(createNpcs(activeNpcCount, activeNpcSpeed))
    setCart([])
    setHasCart(false)
    setReceiptChecked(false)
    setNpcBumps(0)
    setPlayer({ x: 95, y: 700 })
    setCartPos({ x: 68, y: 710 })
    setVelocity({ x: 0, y: 0 })
    setGameOver(false)
    setWon(false)
    setMessage(`Level ${currentLevel.level}: ${currentLevel.label}`)
  }, [levelIndex, selectedMode])

  useEffect(() => {
    if (!selectedCharacter || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          setWon(false)
          setMessage('Time is up. The store closed for this run.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedCharacter, gameOver])

  useEffect(() => {
    if (!selectedCharacter || gameOver) return

    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      pressedKeys.current[key] = true
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter'].includes(key)) {
        event.preventDefault()
      }
      if (key === ' ' || key === 'enter') interact()
      if (key === 't') giveThanks()
      if (key === 'r') resetLevel()
    }

    function onKeyUp(event: KeyboardEvent) {
      pressedKeys.current[event.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [selectedCharacter, gameOver, hasCart, receiptChecked, totalItems, totalSpent, allGoalsMet])

  useEffect(() => {
    if (!selectedCharacter || gameOver) return

    const loop = setInterval(() => {
      const accel = currentLevel.playerSpeed * 0.18
      let ax = 0
      let ay = 0

      if (pressedKeys.current['w'] || pressedKeys.current['arrowup']) ay -= accel
      if (pressedKeys.current['s'] || pressedKeys.current['arrowdown']) ay += accel
      if (pressedKeys.current['a'] || pressedKeys.current['arrowleft']) ax -= accel
      if (pressedKeys.current['d'] || pressedKeys.current['arrowright']) ax += accel

      setVelocity((prev) => {
        const nextVx = clamp((prev.x + ax) * 0.78, -currentLevel.playerSpeed, currentLevel.playerSpeed)
        const nextVy = clamp((prev.y + ay) * 0.78, -currentLevel.playerSpeed, currentLevel.playerSpeed)

        const moving = Math.abs(nextVx) > 0.18 || Math.abs(nextVy) > 0.18
        setIsMoving(moving)

        if (nextVx < -0.05) setFacing('left')
        if (nextVx > 0.05) setFacing('right')

        movePlayer(nextVx, nextVy)

        return { x: nextVx, y: nextVy }
      })
    }, 16)

    return () => clearInterval(loop)
  }, [selectedCharacter, gameOver, shelves, npcs, currentLevel.playerSpeed])

  useEffect(() => {
    if (!selectedCharacter || gameOver || selectedMode !== 'busy' || activeNpcCount === 0) return

    const npcLoop = setInterval(() => {
      setNpcs((prev) =>
        prev.map((npc) => {
          let nextX = npc.x + npc.vx
          let nextY = npc.y + npc.vy

          if (nextX < 215 || nextX > GRID_W - 80) {
            npc.vx = -npc.vx
            nextX = npc.x + npc.vx
          }

          const npcBox = { x: nextX, y: nextY, w: NPC_W, h: NPC_H }
          const hitsShelf = shelves.some((shelf) => overlap(npcBox, shelf))
          const hitsCheckout = overlap(npcBox, checkoutZone)
          const hitsVerifier = overlap(npcBox, verifierZone)

          if (hitsShelf || hitsCheckout || hitsVerifier) {
            npc.vx = -npc.vx
            nextX = npc.x + npc.vx
          }

          return {
            ...npc,
            x: nextX,
            y: nextY,
          }
        })
      )
    }, 32)

    return () => clearInterval(npcLoop)
  }, [selectedCharacter, gameOver, selectedMode, activeNpcCount, shelves])

  useEffect(() => {
    const targetX = clamp(player.x - 240, 0, GRID_W)
    const targetY = clamp(player.y - 260, 0, GRID_H)
    setCamera({ x: targetX, y: targetY })

    const board = boardScrollRef.current
    if (!board) return
    if (typeof window === 'undefined') return
    if (window.innerWidth >= MOBILE_BREAKPOINT) return

    board.scrollTo({
      left: Math.max(0, player.x - board.clientWidth / 2),
      top: Math.max(0, player.y - board.clientHeight / 2),
      behavior: 'auto',
    })
  }, [player])

  useEffect(() => {
    if (!hasCart) return

    const targetX = facing === 'right' ? player.x - 28 : player.x + 26
    const targetY = player.y + 14

    setCartPos((prev) => ({
      x: prev.x + (targetX - prev.x) * 0.22,
      y: prev.y + (targetY - prev.y) * 0.22,
    }))
  }, [player, facing, hasCart])

  function addFloatingText(text: string, x: number, y: number) {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setFloatingTexts((prev) => [...prev, { id, text, x, y }])
    window.setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id))
    }, 950)
  }

  function playerBoxFor(x: number, y: number) {
    return { x, y, w: PLAYER_W, h: PLAYER_H }
  }

  function distanceTo(box: { x: number; y: number; w: number; h: number }) {
    return distanceBetweenCenters(playerBoxFor(player.x, player.y), box)
  }

  function movePlayer(dx: number, dy: number) {
    if (gameOver) return

    const nextX = clamp(player.x + dx, 0, GRID_W - PLAYER_W)
    const nextY = clamp(player.y + dy, 0, GRID_H - PLAYER_H)

    const tryBoth = playerBoxFor(nextX, nextY)
    const tryX = playerBoxFor(nextX, player.y)
    const tryY = playerBoxFor(player.x, nextY)

    const npcHitBoth =
      selectedMode === 'busy' &&
      npcs.some((npc) => overlap(tryBoth, { x: npc.x, y: npc.y, w: NPC_W, h: NPC_H }))

    const blockedBoth =
      shelves.some((shelf) => overlap(tryBoth, shelf)) ||
      overlap(tryBoth, checkoutZone) ||
      overlap(tryBoth, verifierZone) ||
      npcHitBoth

    if (!blockedBoth) {
      setPlayer({ x: nextX, y: nextY })
      return
    }

    if (npcHitBoth) {
      setNpcBumps((prev) => prev + 1)
      setScore((prev) => Math.max(0, prev - 6))
      addFloatingText('-6', player.x + 8, player.y - 10)
      setMessage('Busy store bump. Keep your line clean.')
    }

    const blockedX =
      shelves.some((shelf) => overlap(tryX, shelf)) ||
      overlap(tryX, checkoutZone) ||
      overlap(tryX, verifierZone) ||
      (selectedMode === 'busy' &&
        npcs.some((npc) => overlap(tryX, { x: npc.x, y: npc.y, w: NPC_W, h: NPC_H })))

    const blockedY =
      shelves.some((shelf) => overlap(tryY, shelf)) ||
      overlap(tryY, checkoutZone) ||
      overlap(tryY, verifierZone) ||
      (selectedMode === 'busy' &&
        npcs.some((npc) => overlap(tryY, { x: npc.x, y: npc.y, w: NPC_W, h: NPC_H })))

    setPlayer({
      x: blockedX ? player.x : nextX,
      y: blockedY ? player.y : nextY,
    })
  }

  function addToCart(productId: ProductId) {
    if (!hasCart) {
      setMessage('Grab a cart first.')
      addFloatingText('Need cart', player.x, player.y - 8)
      return
    }

    const product = PRODUCTS[productId]
    const price = PRODUCT_PRICES[productId]
    const nextSpent = totalSpent + price

    if (nextSpent > budget) {
      setMessage(`Not enough budget for ${product.name}.`)
      addFloatingText('Budget', player.x, player.y - 8)
      return
    }

    const matchingShelf = shelves.find((shelf) => shelf.productId === productId)
    if (!matchingShelf || matchingShelf.stock <= 0) {
      setMessage(`${product.name} is out of stock.`)
      addFloatingText('Sold out', player.x, player.y - 8)
      return
    }

    setCart((prev) => {
      const found = prev.find((item) => item.productId === productId)
      if (found) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { productId, qty: 1 }]
    })

    setShelves((prev) =>
      prev.map((shelf) =>
        shelf.productId === productId ? { ...shelf, stock: shelf.stock - 1 } : shelf
      )
    )

    const itemScore = Math.round(price * (selectedMode === 'busy' ? 15 : 11))
    setScore((prev) => prev + itemScore)
    addFloatingText(`${product.emoji} +1`, player.x + 6, player.y - 12)
    setMessage(`${product.name} added to cart.`)
  }

  function interact() {
    if (gameOver || !selectedCharacter) return

    if (distanceTo(cartZone) <= INTERACT_DISTANCE && !hasCart) {
      setHasCart(true)
      setMessage('Cart picked up.')
      addFloatingText('Cart +1', cartZone.x + 12, cartZone.y - 10)
      return
    }

    if (distanceTo(verifierZone) <= INTERACT_DISTANCE) {
      if (totalItems === 0) {
        setMessage('Buy something first. The verifier needs a receipt.')
        return
      }
      setReceiptChecked(true)
      setScore((prev) => prev + 30)
      setMessage('Receipt verified. You may checkout now.')
      addFloatingText('Approved', verifierZone.x + 4, verifierZone.y - 10)
      return
    }

    if (distanceTo(checkoutZone) <= INTERACT_DISTANCE) {
      if (!hasCart) {
        setMessage('Pick up a cart before checkout.')
        return
      }
      if (!allGoalsMet) {
        setMessage('You still need the level goal items.')
        return
      }
      if (!receiptChecked) {
        setMessage('Go to the receipt verifier first.')
        return
      }

      const timeBonus = timeLeft * 3
      const cleanBonus = selectedMode === 'busy' ? Math.max(0, 80 - npcBumps * 8) : 40
      const levelBonus = currentLevel.scoreBonus
      setScore((prev) => prev + timeBonus + cleanBonus + levelBonus)
      setWon(true)
      setGameOver(true)
      setMessage(`Level ${currentLevel.level} complete.`)
      addFloatingText('Level Clear', checkoutZone.x + 20, checkoutZone.y - 10)
      return
    }

    const nearbyShelf = shelves.find((shelf) => distanceTo(shelf) <= INTERACT_DISTANCE)
    if (nearbyShelf) {
      addToCart(nearbyShelf.productId)
      return
    }

    if (distanceTo(exitZone) <= INTERACT_DISTANCE) {
      setMessage('Finish shopping before leaving.')
      return
    }

    setMessage('Move near a cart, shelf, receipt verifier, or checkout and interact.')
  }

  function giveThanks() {
    if (gameOver || !selectedCharacter) return
    setGracePoints((prev) => prev + 1)
    setBudget((prev) => prev + 0.25)
    setScore((prev) => prev + 15)
    addFloatingText('+$0.25', player.x + 8, player.y - 10)
    setMessage('Thankx bonus added.')
  }

  function resetLevel() {
    pressedKeys.current = {}
    setPlayer({ x: 95, y: 700 })
    setVelocity({ x: 0, y: 0 })
    setFacing('right')
    setIsMoving(false)
    setCamera({ x: 0, y: 0 })
    setCartPos({ x: 68, y: 710 })
    setHasCart(false)
    setBudget(currentLevel.budget)
    setTimeLeft(currentLevel.time)
    setReceiptChecked(false)
    setGameOver(false)
    setWon(false)
    setGracePoints(0)
    setNpcBumps(0)
    setCart([])
    setShelves(createShelvesForLevel(currentLevel.level))
    setNpcs(createNpcs(activeNpcCount, activeNpcSpeed))
    setMessage(`Level ${currentLevel.level}: ${currentLevel.label}`)
  }

  function nextLevel() {
    if (levelIndex < LEVELS.length - 1) {
      setLevelIndex((prev) => prev + 1)
    } else {
      setMessage('You cleared all 10 levels. Thankx Mart legend status unlocked.')
      resetLevel()
    }
  }

  async function shareScore() {
    const shareText = `I reached Level ${currentLevel.level} with ${score} points in Thankx Mart 🛒`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Thankx Mart',
          text: shareText,
          url: '/thankx-mart',
        })
        return
      } catch {
      }
    }

    try {
      await navigator.clipboard.writeText(shareText)
      alert('Score copied.')
    } catch {
      alert(shareText)
    }
  }

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 p-6">
        <div className="mx-auto flex min-h-[92vh] max-w-6xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-12">
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-[0.35em] text-orange-500">Thankx Mart</div>
              <h1 className="mt-3 text-4xl font-black text-slate-900 md:text-5xl">Choose your shopper</h1>
              <p className="mt-3 text-slate-500">Pick a character, pick a mode, then conquer Levels 1 to 10.</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedCharacter(id)
                    setLevelIndex(0)
                    setMessage(`Level 1: ${LEVELS[0].label}`)
                  }}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="mx-auto mb-4 h-24 w-16 relative">
                    <HumanFigure
                      x={0}
                      y={0}
                      facing="right"
                      walking={false}
                      shirt={CHARACTERS[id].shirt}
                      pants={CHARACTERS[id].pants}
                      hair={CHARACTERS[id].hair}
                      cameraX={0}
                      cameraY={0}
                      width={36}
                      height={78}
                    />
                  </div>
                  <div className="text-lg font-black text-slate-900">{CHARACTERS[id].label}</div>
                  <div className="mt-1 text-sm text-slate-500">Tap to start</div>
                </button>
              ))}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {(Object.keys(MODE_INFO) as GameMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`rounded-[28px] border p-6 text-left transition ${
                    selectedMode === mode
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-slate-200 bg-slate-50 hover:border-orange-200 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="text-2xl font-black text-slate-900">{MODE_INFO[mode].label}</div>
                  <p className="mt-2 text-sm text-slate-600">{MODE_INFO[mode].description}</p>
                </button>
              ))}
            </div>

            <div className="mt-10 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-2xl font-black text-slate-900">Levels 1 to 10</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {LEVELS.map((level) => (
                  <div key={level.level} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="text-sm font-black text-orange-500">Level {level.level}</div>
                    <div className="mt-1 font-bold text-slate-900">{level.label}</div>
                    <div className="mt-2 text-xs text-slate-500">
                      Budget {formatMoney(level.budget)} · {level.time}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const playerLook = CHARACTERS[selectedCharacter]

  return (
    <div className="min-h-screen bg-[#eef2f5] p-3 text-slate-800 md:p-5">
      <div className="mx-auto max-w-[1720px]">
        <div className="mb-4 grid gap-4 xl:grid-cols-[1.2fr_390px]">
          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Thankx Mart</h1>
                <p className="mt-1 text-sm text-slate-500">Everyday low prices</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Change Player
                </button>
                <button
                  onClick={resetLevel}
                  className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:scale-[1.02]"
                >
                  Reset Level
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Level</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{currentLevel.level}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Mode</div>
                <div className="mt-2 text-lg font-black text-slate-900">{MODE_INFO[selectedMode].label}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Budget</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{formatMoney(budget)}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Spent</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{formatMoney(totalSpent)}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Time</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{timeLeft}s</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Score</div>
                <div className="mt-2 text-2xl font-black text-slate-900">{score}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Receipt</div>
                <div className="mt-2 text-lg font-black text-slate-900">{receiptChecked ? 'Checked' : 'Waiting'}</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              {message}
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-black text-slate-900">How to play</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Move with W A S D or arrow keys.</p>
              <p>Press Space or Enter to interact.</p>
              <p>Press T to get a Thankx bonus.</p>
              <p>Pick up the cart, collect the goal items, visit the receipt verifier, then checkout.</p>
              <p>Busy mode adds moving NPC customers and bonus pressure.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
          <div
            ref={boardScrollRef}
            className="overflow-auto rounded-[32px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
          >
            <div
              className="relative overflow-hidden rounded-[28px] border border-slate-300 bg-[#f8fafc]"
              style={{ width: GRID_W, height: GRID_H }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(226,232,240,0.75)_1px,transparent_1px),linear-gradient(rgba(226,232,240,0.75)_1px,transparent_1px)] bg-[size:46px_46px]" />
              <div className="absolute left-0 top-0 h-full w-[190px] bg-[#eef6ee]" />
              <div className="absolute left-[190px] top-0 h-full w-[18px] bg-slate-300" />

              <div className="absolute left-[420px] right-[40px] top-[40px] h-[56px] rounded-2xl bg-[linear-gradient(180deg,#faf7f0_0%,#f3ede2_100%)] shadow-inner">
                <div className="flex h-full items-center justify-center gap-12 text-sm font-black uppercase tracking-[0.3em] text-slate-400">
                  <span>Bakery</span>
                  <span>Home</span>
                  <span>Sweet Deals</span>
                </div>
              </div>

              <div
                className="absolute rounded-[24px] border-[3px] border-sky-300 bg-white shadow-sm"
                style={{ left: exitZone.x, top: exitZone.y, width: exitZone.w, height: exitZone.h }}
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="text-sm font-black tracking-[0.2em] text-sky-700">EXIT</div>
                  <div className="mt-2 text-4xl">🚪</div>
                </div>
              </div>

              <div
                className="absolute rounded-[24px] border-[3px] border-emerald-300 bg-white shadow-sm"
                style={{ left: entranceZone.x, top: entranceZone.y, width: entranceZone.w, height: entranceZone.h }}
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="text-sm font-black tracking-[0.2em] text-emerald-700">ENTRY</div>
                  <div className="mt-2 text-4xl">🚶</div>
                </div>
              </div>

              <div
                className="absolute rounded-[24px] border-[3px] border-slate-300 bg-white shadow-md"
                style={{ left: cartZone.x, top: cartZone.y, width: cartZone.w, height: cartZone.h }}
              >
                <div className="flex h-full items-center justify-center text-4xl">🛒</div>
              </div>

              <div
                className="absolute rounded-[24px] border-[3px] border-purple-300 bg-white shadow-sm"
                style={{ left: verifierZone.x, top: verifierZone.y, width: verifierZone.w, height: verifierZone.h }}
              >
                <div className="flex h-full items-center justify-center gap-3 px-2">
                  <div className="text-2xl">🧾</div>
                  <div className="relative h-[56px] w-[28px]">
                    <HumanFigure
                      x={0}
                      y={0}
                      facing="right"
                      walking={false}
                      shirt="#6d28d9"
                      pants="#111827"
                      hair="#1f2937"
                      cameraX={0}
                      cameraY={0}
                      width={28}
                      height={56}
                    />
                  </div>
                </div>
              </div>

              <div
                className="absolute rounded-[28px] border-[4px] border-slate-400 bg-gradient-to-b from-slate-100 to-slate-200 shadow-md"
                style={{ left: checkoutZone.x, top: checkoutZone.y, width: checkoutZone.w, height: checkoutZone.h }}
              >
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="text-sm font-black uppercase tracking-[0.22em] text-slate-700">Checkout</div>
                  <div className="mt-2 text-5xl">💳</div>
                </div>
              </div>

              {shelves.map((shelf) => {
                const product = PRODUCTS[shelf.productId]
                return (
                  <div
                    key={shelf.id}
                    className="absolute rounded-[24px] border-[3px] border-slate-300 shadow-md"
                    style={{
                      left: shelf.x,
                      top: shelf.y,
                      width: shelf.w,
                      height: shelf.h,
                      background: `linear-gradient(180deg, white 0%, ${product.color}22 100%)`,
                    }}
                  >
                    <div className="mx-2 mt-2 rounded-xl bg-white px-2 py-1 text-center text-xs font-black text-slate-800 shadow-sm">
                      {product.name} {formatMoney(PRODUCT_PRICES[shelf.productId])}
                    </div>

                    <div className="mx-3 mt-3 grid grid-cols-3 gap-1 text-center text-xl leading-none">
                      {Array.from({ length: Math.max(shelf.stock, 0) }).map((_, index) => (
                        <span key={index}>{product.emoji}</span>
                      ))}
                    </div>

                    <div className="absolute bottom-2 left-2 right-2 h-3 rounded-full bg-slate-300" />
                  </div>
                )
              })}

              {selectedMode === 'busy' &&
                npcs.map((npc) => (
                  <HumanFigure
                    key={npc.id}
                    x={npc.x}
                    y={npc.y}
                    facing={npc.vx >= 0 ? 'right' : 'left'}
                    walking={true}
                    shirt={npc.color}
                    pants="#111827"
                    hair="#374151"
                    cameraX={camera.x}
                    cameraY={camera.y}
                    width={NPC_W}
                    height={NPC_H}
                  />
                ))}

              {hasCart && (
                <div
                  style={{
                    position: 'absolute',
                    left: cartPos.x - camera.x,
                    top: cartPos.y - camera.y,
                    width: 36,
                    height: 30,
                    borderRadius: 10,
                    border: '3px solid #64748b',
                    background: 'white',
                    boxShadow: '0 10px 20px rgba(15,23,42,0.12)',
                    transform: `rotate(${isMoving ? (facing === 'right' ? '5deg' : '-5deg') : '0deg'})`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: -10,
                      left: 2,
                      width: 14,
                      height: 12,
                      borderTop: '3px solid #64748b',
                      borderLeft: '3px solid #64748b',
                      borderRight: '3px solid #64748b',
                      borderTopLeftRadius: 8,
                      borderTopRightRadius: 8,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -8,
                      left: 5,
                      width: 8,
                      height: 8,
                      borderRadius: '999px',
                      background: '#334155',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -8,
                      right: 5,
                      width: 8,
                      height: 8,
                      borderRadius: '999px',
                      background: '#334155',
                    }}
                  />
                </div>
              )}

              <HumanFigure
                x={player.x}
                y={player.y}
                facing={facing}
                walking={isMoving}
                shirt={playerLook.shirt}
                pants={playerLook.pants}
                hair={playerLook.hair}
                cameraX={camera.x}
                cameraY={camera.y}
                width={PLAYER_W}
                height={PLAYER_H}
              />

              {floatingTexts.map((item) => (
                <div
                  key={item.id}
                  className="pointer-events-none absolute animate-pulse rounded-full bg-white/90 px-2 py-1 text-xs font-black text-orange-600 shadow"
                  style={{ left: item.x - camera.x, top: item.y - camera.y }}
                >
                  {item.text}
                </div>
              ))}

              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
                    <div className="text-5xl">{won ? '🏆' : '⏰'}</div>
                    <h3 className="mt-3 text-3xl font-black text-slate-900">
                      {won ? `Level ${currentLevel.level} Complete` : 'Run Over'}
                    </h3>
                    <p className="mt-2 text-slate-600">
                      {won ? currentLevel.label : 'Give it another run through the aisles.'}
                    </p>
                    <div className="mt-4 text-lg font-bold text-orange-600">Score: {score}</div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      {won ? (
                        <button
                          onClick={nextLevel}
                          className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]"
                        >
                          {levelIndex < LEVELS.length - 1 ? 'Next Level' : 'Play Again'}
                        </button>
                      ) : (
                        <button
                          onClick={resetLevel}
                          className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]"
                        >
                          Retry Level
                        </button>
                      )}

                      <button
                        onClick={shareScore}
                        className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]"
                      >
                        Share Score
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <h3 className="text-xl font-black text-slate-900">Level goals</h3>
              <div className="mt-2 text-sm text-slate-500">
                {currentLevel.label}
              </div>

              <div className="mt-4 space-y-3">
                {objectiveProgress.map((goal) => {
                  const product = PRODUCTS[goal.productId]
                  return (
                    <div
                      key={goal.productId}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{product.emoji}</span>
                        <div>
                          <div className="font-bold text-slate-900">{product.name}</div>
                          <div className="text-xs text-slate-500">Need {goal.qty}</div>
                        </div>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          goal.done ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {goal.found}/{goal.qty}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900">Your cart</h3>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  {totalItems} items
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Your cart is empty.
                  </div>
                ) : (
                  cart.map((item) => {
                    const product = PRODUCTS[item.productId]
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.emoji}</span>
                          <div>
                            <div className="font-bold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-500">{formatMoney(PRODUCT_PRICES[item.productId])} each</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-slate-900">x{item.qty}</div>
                          <div className="text-xs text-slate-500">
                            {formatMoney(PRODUCT_PRICES[item.productId] * item.qty)}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-black text-slate-900">{formatMoney(totalSpent)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Grace points</span>
                  <span className="font-black text-slate-900">{gracePoints}</span>
                </div>
                {selectedMode === 'busy' && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">NPC bumps</span>
                    <span className="font-black text-slate-900">{npcBumps}</span>
                  </div>
                )}
              </div>

              <button
                onClick={giveThanks}
                className="mt-4 w-full rounded-2xl bg-emerald-500 px-4 py-3 font-semibold text-white shadow transition hover:scale-[1.01]"
              >
                Give Thankx 💛
              </button>
            </div>
          </div>
        </div>

        <div className="fixed bottom-5 right-5 z-50 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <button
            onTouchStart={() => {
              pressedKeys.current['arrowup'] = true
            }}
            onTouchEnd={() => {
              pressedKeys.current['arrowup'] = false
            }}
            onClick={() => movePlayer(0, -28)}
            className="rounded-2xl bg-slate-900 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬆️
          </button>
          <div />

          <button
            onTouchStart={() => {
              pressedKeys.current['arrowleft'] = true
              setFacing('left')
            }}
            onTouchEnd={() => {
              pressedKeys.current['arrowleft'] = false
            }}
            onClick={() => {
              setFacing('left')
              movePlayer(-28, 0)
            }}
            className="rounded-2xl bg-slate-900 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬅️
          </button>

          <button
            onClick={interact}
            className="rounded-2xl bg-orange-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ✋
          </button>

          <button
            onTouchStart={() => {
              pressedKeys.current['arrowright'] = true
              setFacing('right')
            }}
            onTouchEnd={() => {
              pressedKeys.current['arrowright'] = false
            }}
            onClick={() => {
              setFacing('right')
              movePlayer(28, 0)
            }}
            className="rounded-2xl bg-slate-900 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ➡️
          </button>

          <button
            onClick={giveThanks}
            className="rounded-2xl bg-emerald-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            💛
          </button>

          <button
            onTouchStart={() => {
              pressedKeys.current['arrowdown'] = true
            }}
            onTouchEnd={() => {
              pressedKeys.current['arrowdown'] = false
            }}
            onClick={() => movePlayer(0, 28)}
            className="rounded-2xl bg-slate-900 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬇️
          </button>

          <button
            onClick={resetLevel}
            className="rounded-2xl bg-slate-700 p-3 text-lg text-white shadow-lg active:scale-95"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  )
}