'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type ProductId = 'cookies' | 'candles' | 'cakes' | 'cupcakes' | 'honeybun' | 'candy'
type CharacterId = 'teenboy' | 'teengirl' | 'man' | 'woman'
type GameMode = 'normal' | 'busy'

type Product = {
  id: ProductId
  name: string
  price: number
  emoji: string
  shelfColor: string
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
  dirX: number
  dirY: number
  speed: number
  emoji: string
  mood: string
}

const GRID_W = 1280
const GRID_H = 820
const PLAYER_SIZE = 56
const PLAYER_SPEED = 10
const INTERACT_DISTANCE = 96
const MOBILE_BREAKPOINT = 768

const PRODUCTS: Record<ProductId, Product> = {
  cookies: { id: 'cookies', name: 'Cookies', price: 8.5, emoji: '🍪', shelfColor: 'bg-amber-50' },
  candles: { id: 'candles', name: 'Candles', price: 7.99, emoji: '🕯️', shelfColor: 'bg-stone-50' },
  cakes: { id: 'cakes', name: 'Cakes', price: 11.99, emoji: '🎂', shelfColor: 'bg-rose-50' },
  cupcakes: { id: 'cupcakes', name: 'Cupcakes', price: 4.29, emoji: '🧁', shelfColor: 'bg-pink-50' },
  honeybun: { id: 'honeybun', name: 'Honey Bun', price: 2.99, emoji: '🍯', shelfColor: 'bg-yellow-50' },
  candy: { id: 'candy', name: 'Candy', price: 3.49, emoji: '🍬', shelfColor: 'bg-sky-50' },
}

const INITIAL_SHELVES: Shelf[] = [
  { id: 's1', x: 500, y: 100, w: 150, h: 105, productId: 'cookies', stock: 6 },
  { id: 's2', x: 730, y: 100, w: 150, h: 105, productId: 'candles', stock: 6 },
  { id: 's3', x: 960, y: 100, w: 150, h: 105, productId: 'cakes', stock: 4 },
  { id: 's4', x: 500, y: 470, w: 150, h: 105, productId: 'cupcakes', stock: 6 },
  { id: 's5', x: 730, y: 470, w: 150, h: 105, productId: 'honeybun', stock: 5 },
  { id: 's6', x: 960, y: 470, w: 150, h: 105, productId: 'candy', stock: 8 },
]

const CHARACTERS: Record<CharacterId, { label: string; emoji: string }> = {
  teenboy: { label: 'Teen Boy', emoji: '🧑' },
  teengirl: { label: 'Teen Girl', emoji: '👧' },
  man: { label: 'Man', emoji: '👨' },
  woman: { label: 'Woman', emoji: '👩' },
}

const MODE_INFO: Record<GameMode, { label: string; subtitle: string; badge: string }> = {
  normal: {
    label: 'Normal Mode',
    subtitle: 'Just shop and checkout',
    badge: 'Easy roll',
  },
  busy: {
    label: 'Busy Store Mode',
    subtitle: 'NPC customers, pressure, and bonus score',
    badge: 'Crowded aisles',
  },
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function overlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
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

function randomNpcEmoji() {
  const options = ['🧔', '👩', '👨', '👵', '👨‍🦱', '👩‍🦰']
  return options[Math.floor(Math.random() * options.length)]
}

function createInitialNpcs(): Npc[] {
  return [
    { id: 'npc1', x: 430, y: 260, dirX: 1, dirY: 0, speed: 2.2, emoji: randomNpcEmoji(), mood: 'Browsing' },
    { id: 'npc2', x: 890, y: 300, dirX: -1, dirY: 0, speed: 2.4, emoji: randomNpcEmoji(), mood: 'Shopping' },
    { id: 'npc3', x: 650, y: 660, dirX: 1, dirY: 0, speed: 2.0, emoji: randomNpcEmoji(), mood: 'Comparing' },
    { id: 'npc4', x: 1020, y: 650, dirX: -1, dirY: 0, speed: 2.6, emoji: randomNpcEmoji(), mood: 'Rushing' },
  ]
}

export default function ThankxMartPage() {
  const entranceZone = { x: 35, y: 600, w: 140, h: 150 }
  const exitZone = { x: 35, y: 40, w: 140, h: 150 }
  const cartZone = { x: 220, y: 610, w: 125, h: 88 }
  const checkoutZone = { x: 205, y: 150, w: 180, h: 150 }
  const verifierZone = { x: 235, y: 58, w: 112, h: 70 }

  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId | null>(null)
  const [selectedMode, setSelectedMode] = useState<GameMode>('normal')
  const [player, setPlayer] = useState({ x: 82, y: 655 })
  const [playerBob, setPlayerBob] = useState(0)
  const [hasCart, setHasCart] = useState(false)
  const [budget, setBudget] = useState(25)
  const [timeLeft, setTimeLeft] = useState(95)
  const [score, setScore] = useState(0)
  const [gracePoints, setGracePoints] = useState(0)
  const [message, setMessage] = useState('Choose a shopper and mode to begin.')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [receiptChecked, setReceiptChecked] = useState(false)
  const [shelves, setShelves] = useState<Shelf[]>(INITIAL_SHELVES)
  const [cart, setCart] = useState<CartItem[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [facing, setFacing] = useState<'left' | 'right'>('right')
  const [isMoving, setIsMoving] = useState(false)
  const [npcs, setNpcs] = useState<Npc[]>(createInitialNpcs())
  const [npcBumps, setNpcBumps] = useState(0)
  const [verifierMood, setVerifierMood] = useState<'waiting' | 'checking' | 'approved'>('waiting')

  const pressedKeys = useRef<Record<string, boolean>>({})
  const boardScrollRef = useRef<HTMLDivElement | null>(null)

  const goals = useMemo(
    () => [
      { productId: 'cookies' as ProductId, qty: 1 },
      { productId: 'cupcakes' as ProductId, qty: 1 },
      { productId: 'honeybun' as ProductId, qty: 1 },
    ],
    []
  )

  const totalSpent = useMemo(
    () => cart.reduce((sum, item) => sum + PRODUCTS[item.productId].price * item.qty, 0),
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

  useEffect(() => {
    if (!selectedCharacter || gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          setWon(false)
          setMessage('Store closed for the round. Try again.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [selectedCharacter, gameOver])

  useEffect(() => {
    if (!selectedCharacter || gameOver) return

    function handleKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      pressedKeys.current[key] = true

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter'].includes(key)) {
        event.preventDefault()
      }

      if (key === ' ' || key === 'enter') interact()
      if (key === 't') giveThanks()
      if (key === 'r') resetGame(selectedCharacter, selectedMode)
    }

    function handleKeyUp(event: KeyboardEvent) {
      pressedKeys.current[event.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    const loop = setInterval(() => {
      let dx = 0
      let dy = 0

      if (pressedKeys.current['w'] || pressedKeys.current['arrowup']) dy -= PLAYER_SPEED
      if (pressedKeys.current['s'] || pressedKeys.current['arrowdown']) dy += PLAYER_SPEED
      if (pressedKeys.current['a'] || pressedKeys.current['arrowleft']) dx -= PLAYER_SPEED
      if (pressedKeys.current['d'] || pressedKeys.current['arrowright']) dx += PLAYER_SPEED

      if (dx !== 0 || dy !== 0) {
        movePlayer(dx, dy)
        setIsMoving(true)
        setPlayerBob((prev) => (prev + 1) % 8)
        if (dx < 0) setFacing('left')
        if (dx > 0) setFacing('right')
      } else {
        setIsMoving(false)
        setPlayerBob(0)
      }
    }, 16)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      clearInterval(loop)
    }
  }, [selectedCharacter, gameOver, shelves, hasCart, totalSpent, totalItems, gracePoints, timeLeft, selectedMode, npcBumps, receiptChecked])

  useEffect(() => {
    const board = boardScrollRef.current
    if (!board) return
    if (typeof window === 'undefined') return
    if (window.innerWidth >= MOBILE_BREAKPOINT) return

    const targetLeft = Math.max(0, player.x - board.clientWidth / 2 + PLAYER_SIZE / 2)
    const targetTop = Math.max(0, player.y - board.clientHeight / 2 + PLAYER_SIZE / 2)

    board.scrollTo({
      left: targetLeft,
      top: targetTop,
      behavior: 'auto',
    })
  }, [player])

  useEffect(() => {
    if (!selectedCharacter || gameOver || selectedMode !== 'busy') return

    const npcLoop = setInterval(() => {
      setNpcs((prev) =>
        prev.map((npc) => {
          let nextX = npc.x + npc.dirX * npc.speed
          let nextY = npc.y + npc.dirY * npc.speed
          let nextDirX = npc.dirX
          let nextDirY = npc.dirY

          const npcBox = { x: nextX, y: nextY, w: 42, h: 42 }
          const hitsShelf = shelves.some((shelf) => overlap(npcBox, shelf))
          const hitsCheckout = overlap(npcBox, checkoutZone)
          const outOfBounds =
            nextX < 200 || nextX > GRID_W - 60 || nextY < 40 || nextY > GRID_H - 60

          if (hitsShelf || hitsCheckout || outOfBounds) {
            const dirs = [
              { x: 1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: 1 },
              { x: 0, y: -1 },
            ]
            const pick = dirs[Math.floor(Math.random() * dirs.length)]
            nextDirX = pick.x
            nextDirY = pick.y
            nextX = npc.x + nextDirX * npc.speed
            nextY = npc.y + nextDirY * npc.speed
          }

          const playerBox = playerBoxFor(player.x, player.y)
          const futureNpcBox = { x: nextX, y: nextY, w: 42, h: 42 }

          if (overlap(playerBox, futureNpcBox)) {
            nextDirX = -nextDirX || (Math.random() > 0.5 ? 1 : -1)
            nextDirY = -nextDirY
            nextX = npc.x + nextDirX * npc.speed
            nextY = npc.y + nextDirY * npc.speed
          }

          return {
            ...npc,
            x: nextX,
            y: nextY,
            dirX: nextDirX,
            dirY: nextDirY,
          }
        })
      )
    }, 32)

    return () => clearInterval(npcLoop)
  }, [selectedCharacter, gameOver, selectedMode, shelves, player.x, player.y])

  function addFloatingText(text: string, x: number, y: number) {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setFloatingTexts((prev) => [...prev, { id, text, x, y }])

    window.setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id))
    }, 900)
  }

  function playerBoxFor(x: number, y: number) {
    return { x, y, w: PLAYER_SIZE, h: PLAYER_SIZE }
  }

  function distanceTo(box: { x: number; y: number; w: number; h: number }) {
    return distanceBetweenCenters(playerBoxFor(player.x, player.y), box)
  }

  function movePlayer(dx: number, dy: number) {
    if (gameOver) return

    const nextX = clamp(player.x + dx, 0, GRID_W - PLAYER_SIZE)
    const nextY = clamp(player.y + dy, 0, GRID_H - PLAYER_SIZE)

    const tryXBox = playerBoxFor(nextX, player.y)
    const tryYBox = playerBoxFor(player.x, nextY)
    const tryBothBox = playerBoxFor(nextX, nextY)

    const hitsShelfBoth = shelves.some((shelf) => overlap(tryBothBox, shelf))
    const hitsCheckoutBoth = overlap(tryBothBox, checkoutZone)
    const hitsVerifierBoth = overlap(tryBothBox, verifierZone)
    const hitsNpcBoth =
      selectedMode === 'busy' && npcs.some((npc) => overlap(tryBothBox, { x: npc.x, y: npc.y, w: 42, h: 42 }))

    if (!hitsShelfBoth && !hitsCheckoutBoth && !hitsVerifierBoth && !hitsNpcBoth) {
      setPlayer({ x: nextX, y: nextY })
      return
    }

    if (hitsNpcBoth && selectedMode === 'busy') {
      setNpcBumps((prev) => prev + 1)
      setScore((prev) => Math.max(0, prev - 8))
      setMessage('Watch the customers. Busy aisles cost points.')
      addFloatingText('-8', player.x + 8, player.y - 10)
    }

    const hitsShelfX = shelves.some((shelf) => overlap(tryXBox, shelf))
    const hitsCheckoutX = overlap(tryXBox, checkoutZone)
    const hitsVerifierX = overlap(tryXBox, verifierZone)
    const hitsNpcX =
      selectedMode === 'busy' && npcs.some((npc) => overlap(tryXBox, { x: npc.x, y: npc.y, w: 42, h: 42 }))

    const hitsShelfY = shelves.some((shelf) => overlap(tryYBox, shelf))
    const hitsCheckoutY = overlap(tryYBox, checkoutZone)
    const hitsVerifierY = overlap(tryYBox, verifierZone)
    const hitsNpcY =
      selectedMode === 'busy' && npcs.some((npc) => overlap(tryYBox, { x: npc.x, y: npc.y, w: 42, h: 42 }))

    setPlayer({
      x: !hitsShelfX && !hitsCheckoutX && !hitsVerifierX && !hitsNpcX ? nextX : player.x,
      y: !hitsShelfY && !hitsCheckoutY && !hitsVerifierY && !hitsNpcY ? nextY : player.y,
    })
  }

  function addToCart(productId: ProductId) {
    const product = PRODUCTS[productId]
    const nextSpent = totalSpent + product.price

    if (!hasCart) {
      setMessage('Grab a cart first.')
      addFloatingText('Need cart', player.x, player.y - 8)
      return
    }

    if (nextSpent > budget) {
      setMessage(`Not enough budget for ${product.name}.`)
      addFloatingText('Too much 💸', player.x, player.y - 8)
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
        return prev.map((item) => (item.productId === productId ? { ...item, qty: item.qty + 1 } : item))
      }
      return [...prev, { productId, qty: 1 }]
    })

    setShelves((prev) =>
      prev.map((shelf) => (shelf.productId === productId ? { ...shelf, stock: shelf.stock - 1 } : shelf))
    )

    const modeBonus = selectedMode === 'busy' ? 14 : 10
    setScore((prev) => prev + Math.round(product.price * modeBonus))
    setMessage(`${product.name} added to cart.`)
    addFloatingText(`${product.emoji} +1`, player.x + 4, player.y - 12)
  }

  function interact() {
    if (gameOver || !selectedCharacter) return

    if (distanceTo(cartZone) <= INTERACT_DISTANCE && !hasCart) {
      setHasCart(true)
      setMessage('Cart picked up.')
      addFloatingText('Cart +1', cartZone.x + 10, cartZone.y - 10)
      return
    }

    if (distanceTo(checkoutZone) <= INTERACT_DISTANCE) {
      if (!hasCart) {
        setMessage('Pick up a cart before checkout.')
        return
      }
      if (!allGoalsMet) {
        setMessage('Get the goal items first.')
        return
      }
      if (totalItems === 0) {
        setMessage('Your cart is empty.')
        return
      }
      if (!receiptChecked) {
        setMessage('Take your receipt to the verifier first.')
        return
      }

      const busyBonus = selectedMode === 'busy' ? 220 : 150
      const cleanAisleBonus = selectedMode === 'busy' ? Math.max(0, 80 - npcBumps * 10) : 0

      setScore((prev) => prev + busyBonus + timeLeft * 3 + gracePoints * 10 + cleanAisleBonus)
      setWon(true)
      setGameOver(true)
      setMessage('Checkout complete.')
      addFloatingText('Paid ✅', checkoutZone.x + 35, checkoutZone.y - 12)
      return
    }

    if (distanceTo(verifierZone) <= INTERACT_DISTANCE) {
      if (totalItems === 0) {
        setMessage('Buy something first so the verifier has a receipt to check.')
        return
      }

      setReceiptChecked(true)
      setVerifierMood('approved')
      setMessage('Receipt verified. You can checkout now.')
      setScore((prev) => prev + 35)
      addFloatingText('Receipt OK', verifierZone.x + 4, verifierZone.y - 10)
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

    setMessage('Move near a cart, shelf, verifier, or checkout and interact.')
  }

  function giveThanks() {
    if (gameOver || !selectedCharacter) return

    const bonus = Math.min(3, 1 + Math.floor(gracePoints / 3))
    setGracePoints((prev) => prev + 1)
    setBudget((prev) => prev + 0.25)
    setScore((prev) => prev + 20 * bonus)
    setMessage('Thankx bonus added.')
    addFloatingText('+$0.25 💛', player.x + 6, player.y - 10)
  }

  function resetGame(characterOverride?: CharacterId | null, modeOverride?: GameMode) {
    pressedKeys.current = {}
    setPlayer({ x: 82, y: 655 })
    setHasCart(false)
    setBudget(25)
    setTimeLeft(modeOverride === 'busy' ? 85 : 95)
    setScore(0)
    setGracePoints(0)
    setMessage('New round started.')
    setGameOver(false)
    setWon(false)
    setReceiptChecked(false)
    setVerifierMood('waiting')
    setShelves(INITIAL_SHELVES)
    setCart([])
    setFloatingTexts([])
    setFacing('right')
    setIsMoving(false)
    setPlayerBob(0)
    setNpcBumps(0)
    setNpcs(createInitialNpcs())
    if (characterOverride !== undefined) setSelectedCharacter(characterOverride)
    if (modeOverride) setSelectedMode(modeOverride)
  }

  async function shareScore() {
    const shareText = `I scored ${score} at Thankx Mart 🛒🔥`

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

  const trolleyLeft =
    facing === 'right'
      ? player.x - 22
      : player.x + 32

  const trolleyTop = player.y + 10 + (isMoving ? (playerBob % 2 === 0 ? 2 : -2) : 0)

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 p-6">
        <div className="mx-auto flex min-h-[92vh] max-w-6xl items-center justify-center">
          <div className="w-full rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-12">
            <div className="text-center">
              <div className="text-sm font-bold uppercase tracking-[0.35em] text-orange-500">Thankx Mart</div>
              <h1 className="mt-3 text-4xl font-black text-slate-900 md:text-5xl">Choose your shopper</h1>
              <p className="mt-3 text-slate-500">Pick a character and mode, then enter the store.</p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => {
                    setSelectedCharacter(id)
                    setMessage('Shopper ready. Head to the cart.')
                    resetGame(id, selectedMode)
                  }}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center transition hover:-translate-y-1 hover:border-orange-300 hover:bg-orange-50"
                >
                  <div className="text-6xl">{CHARACTERS[id].emoji}</div>
                  <div className="mt-4 text-lg font-black text-slate-900">{CHARACTERS[id].label}</div>
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
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">
                    {MODE_INFO[mode].badge}
                  </div>
                  <h2 className="mt-3 text-2xl font-black text-slate-900">{MODE_INFO[mode].label}</h2>
                  <p className="mt-2 text-sm text-slate-600">{MODE_INFO[mode].subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentCharacter = CHARACTERS[selectedCharacter]

  return (
    <div className="min-h-screen bg-[#eef2f5] p-3 text-slate-800 md:p-5">
      <div className="mx-auto max-w-[1680px]">
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
                  onClick={() => resetGame(selectedCharacter, selectedMode)}
                  className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:scale-[1.02]"
                >
                  Reset Game
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Shopper</div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl">{currentCharacter.emoji}</span>
                  <span className="text-lg font-black text-slate-900">{currentCharacter.label}</span>
                </div>
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
              <p>On mobile, use the touch buttons and the camera will follow you.</p>
              <p>Pick up the cart, collect the goal items, visit the receipt verifier, then checkout.</p>
              {selectedMode === 'busy' && <p>Busy mode has moving customers and extra score pressure.</p>}
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
              <div className="absolute left-0 top-0 h-full w-[175px] bg-[#eef6ee]" />
              <div className="absolute left-[175px] top-0 h-full w-[18px] bg-slate-300" />

              <div className="absolute left-[395px] right-[40px] top-[40px] h-[54px] rounded-2xl bg-[linear-gradient(180deg,#faf7f0_0%,#f3ede2_100%)] shadow-inner">
                <div className="flex h-full items-center justify-center gap-10 text-sm font-black uppercase tracking-[0.3em] text-slate-400">
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
                <div className="flex h-full items-center justify-center gap-2 px-2">
                  <span className="text-2xl">🧾</span>
                  <span className="text-2xl">
                    {verifierMood === 'approved' ? '🧑‍💼' : verifierMood === 'checking' ? '🤓' : '🕵️'}
                  </span>
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
                    className={`absolute rounded-[24px] border-[3px] border-slate-300 ${product.shelfColor} shadow-md`}
                    style={{ left: shelf.x, top: shelf.y, width: shelf.w, height: shelf.h }}
                  >
                    <div className="mx-2 mt-2 rounded-xl bg-white px-2 py-1 text-center text-xs font-black text-slate-800 shadow-sm">
                      {product.name} {formatMoney(product.price)}
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
                npcs.map((npc, index) => (
                  <div
                    key={npc.id}
                    className="absolute rounded-full bg-white shadow-[0_10px_22px_rgba(15,23,42,0.12)]"
                    style={{
                      left: npc.x,
                      top: npc.y + (index % 2 === 0 ? 1 : -1),
                      width: 42,
                      height: 42,
                    }}
                  >
                    <div className="flex h-full items-center justify-center text-[24px]">{npc.emoji}</div>
                  </div>
                ))}

              {hasCart && (
                <div
                  className="absolute text-[30px] transition-all duration-75"
                  style={{
                    left: trolleyLeft,
                    top: trolleyTop,
                    transform: isMoving ? `rotate(${facing === 'right' ? 3 : -3}deg)` : 'rotate(0deg)',
                  }}
                >
                  🛒
                </div>
              )}

              <div
                className={`absolute rounded-full border-[4px] border-orange-500 bg-white shadow-[0_12px_30px_rgba(249,115,22,0.3)] transition-transform duration-75 ${
                  isMoving ? 'scale-[1.05]' : 'scale-100'
                }`}
                style={{
                  left: player.x,
                  top: player.y + (isMoving ? (playerBob % 2 === 0 ? -2 : 2) : 0),
                  width: PLAYER_SIZE,
                  height: PLAYER_SIZE,
                }}
              >
                <div className="flex h-full items-center justify-center text-[30px]">
                  <span className={facing === 'left' ? '-scale-x-100 transform' : ''}>
                    {currentCharacter.emoji}
                  </span>
                </div>
              </div>

              {floatingTexts.map((item) => (
                <div
                  key={item.id}
                  className="pointer-events-none absolute animate-pulse rounded-full bg-white/90 px-2 py-1 text-xs font-black text-orange-600 shadow"
                  style={{ left: item.x, top: item.y }}
                >
                  {item.text}
                </div>
              ))}

              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
                    <div className="text-5xl">{won ? '🏆' : '⏰'}</div>
                    <h3 className="mt-3 text-3xl font-black text-slate-900">{won ? 'Checkout Complete' : 'Run Over'}</h3>
                    <p className="mt-2 text-slate-600">
                      {won ? 'You finished your shopping run.' : 'Give it another run through the aisles.'}
                    </p>
                    <div className="mt-4 text-lg font-bold text-orange-600">Final Score: {score}</div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <button
                        onClick={() => resetGame(selectedCharacter, selectedMode)}
                        className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]"
                      >
                        Play Again
                      </button>

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
              <h3 className="text-xl font-black text-slate-900">Goal items</h3>

              <div className="mt-4 space-y-3">
                {objectiveProgress.map((goal) => {
                  const product = PRODUCTS[goal.productId]

                  return (
                    <div key={goal.productId} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
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
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{totalItems} items</div>
              </div>

              <div className="mt-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Your cart is empty.</div>
                ) : (
                  cart.map((item) => {
                    const product = PRODUCTS[item.productId]

                    return (
                      <div key={item.productId} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.emoji}</span>
                          <div>
                            <div className="font-bold text-slate-900">{product.name}</div>
                            <div className="text-xs text-slate-500">{formatMoney(product.price)} each</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-slate-900">x{item.qty}</div>
                          <div className="text-xs text-slate-500">{formatMoney(product.price * item.qty)}</div>
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

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Receipt verified</span>
                  <span className="font-black text-slate-900">{receiptChecked ? 'Yes' : 'No'}</span>
                </div>
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
            onTouchStart={() => movePlayer(0, -34)}
            onClick={() => movePlayer(0, -34)}
            className="rounded-2xl bg-slate-900 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬆️
          </button>
          <div />

          <button
            onTouchStart={() => {
              setFacing('left')
              movePlayer(-34, 0)
            }}
            onClick={() => {
              setFacing('left')
              movePlayer(-34, 0)
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
              setFacing('right')
              movePlayer(34, 0)
            }}
            onClick={() => {
              setFacing('right')
              movePlayer(34, 0)
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
            onTouchStart={() => movePlayer(0, 34)}
            onClick={() => movePlayer(0, 34)}
            className="rounded-2xl bg-slate-900 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬇️
          </button>

          <button
            onClick={() => resetGame(selectedCharacter, selectedMode)}
            className="rounded-2xl bg-slate-700 p-3 text-lg text-white shadow-lg active:scale-95"
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  )
}