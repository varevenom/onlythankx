'use client'

import { useEffect, useMemo, useState } from 'react'

type ProductId = 'cookies' | 'candles' | 'cakes' | 'cupcakes' | 'honeybun' | 'candy'

type Product = {
  id: ProductId
  name: string
  price: number
  emoji: string
  color: string
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

const GRID_W = 920
const GRID_H = 560
const PLAYER_SIZE = 32
const MOVE_STEP = 18
const INTERACT_DISTANCE = 78

const PRODUCTS: Record<ProductId, Product> = {
  cookies: { id: 'cookies', name: 'Cookies', price: 8.5, emoji: '🍪', color: 'from-amber-100 to-orange-200' },
  candles: { id: 'candles', name: 'Candles', price: 7.99, emoji: '🕯️', color: 'from-yellow-100 to-orange-100' },
  cakes: { id: 'cakes', name: 'Cakes', price: 11.99, emoji: '🎂', color: 'from-pink-100 to-rose-200' },
  cupcakes: { id: 'cupcakes', name: 'Cupcakes', price: 4.29, emoji: '🧁', color: 'from-fuchsia-100 to-pink-200' },
  honeybun: { id: 'honeybun', name: 'Honey Bun', price: 2.99, emoji: '🍯', color: 'from-yellow-100 to-amber-200' },
  candy: { id: 'candy', name: 'Candy', price: 3.49, emoji: '🍬', color: 'from-cyan-100 to-sky-200' },
}

const INITIAL_SHELVES: Shelf[] = [
  { id: 's1', x: 420, y: 60, w: 124, h: 88, productId: 'cookies', stock: 5 },
  { id: 's2', x: 640, y: 52, w: 124, h: 104, productId: 'candles', stock: 5 },
  { id: 's3', x: 806, y: 38, w: 90, h: 124, productId: 'cakes', stock: 4 },
  { id: 's4', x: 420, y: 286, w: 124, h: 94, productId: 'cupcakes', stock: 6 },
  { id: 's5', x: 642, y: 252, w: 124, h: 98, productId: 'honeybun', stock: 5 },
  { id: 's6', x: 808, y: 256, w: 92, h: 94, productId: 'candy', stock: 8 },
]

const THANKX_LINES = [
  'Thank the baker ✨',
  'Thank the cashier 💛',
  'Thank the store 🛒',
  'Everyday low prices, everyday tiny joy 🌟',
]

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function overlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export default function ThankxMartPage() {
  const entrance = { x: 24, y: 392, w: 90, h: 134 }
  const exitZone = { x: 24, y: 24, w: 90, h: 134 }
  const cartZone = { x: 174, y: 358, w: 82, h: 60 }
  const checkoutZone = { x: 165, y: 102, w: 138, h: 118 }

  const [player, setPlayer] = useState({ x: 60, y: 450 })
  const [hasCart, setHasCart] = useState(false)
  const [budget, setBudget] = useState(25)
  const [timeLeft, setTimeLeft] = useState(75)
  const [score, setScore] = useState(0)
  const [gracePoints, setGracePoints] = useState(0)
  const [message, setMessage] = useState('Enter Thankx Mart, grab a cart, collect the deals, and checkout.')
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [shelves, setShelves] = useState<Shelf[]>(INITIAL_SHELVES)
  const [cart, setCart] = useState<CartItem[]>([])
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([])
  const [thankIndex, setThankIndex] = useState(0)

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
    if (gameOver) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true)
          setWon(false)
          setMessage('Time ran out. The sale comet zoomed away ☄️')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameOver])

  useEffect(() => {
    const timer = setInterval(() => {
      setThankIndex((prev) => (prev + 1) % THANKX_LINES.length)
    }, 2400)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const key = event.key.toLowerCase()

      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'enter'].includes(key)) {
        event.preventDefault()
      }

      if (key === 'arrowup' || key === 'w') movePlayer(0, -MOVE_STEP)
      if (key === 'arrowdown' || key === 's') movePlayer(0, MOVE_STEP)
      if (key === 'arrowleft' || key === 'a') movePlayer(-MOVE_STEP, 0)
      if (key === 'arrowright' || key === 'd') movePlayer(MOVE_STEP, 0)
      if (key === ' ' || key === 'enter') interact()
      if (key === 'r') resetGame()
      if (key === 't') giveThanks()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  function addFloatingText(text: string, x: number, y: number) {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setFloatingTexts((prev) => [...prev, { id, text, x, y }])

    window.setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((item) => item.id !== id))
    }, 900)
  }

  function distanceTo(box: { x: number; y: number; w: number; h: number }) {
    const px = player.x + PLAYER_SIZE / 2
    const py = player.y + PLAYER_SIZE / 2
    const bx = box.x + box.w / 2
    const by = box.y + box.h / 2
    return Math.hypot(px - bx, py - by)
  }

  function movePlayer(dx: number, dy: number) {
    if (gameOver) return

    const next = {
      x: clamp(player.x + dx, 0, GRID_W - PLAYER_SIZE),
      y: clamp(player.y + dy, 0, GRID_H - PLAYER_SIZE),
    }

    const playerBox = { x: next.x, y: next.y, w: PLAYER_SIZE, h: PLAYER_SIZE }
    const blockedByShelf = shelves.some((shelf) => overlap(playerBox, shelf))
    const blockedByCheckout = overlap(playerBox, checkoutZone)

    if (blockedByShelf || blockedByCheckout) return
    setPlayer(next)
  }

  function addToCart(productId: ProductId) {
    const product = PRODUCTS[productId]
    const nextSpent = totalSpent + product.price

    if (!hasCart) {
      setMessage('Grab the cart first 🛒')
      addFloatingText('Need cart', player.x, player.y - 6)
      return
    }

    if (nextSpent > budget) {
      setMessage(`Not enough budget for ${product.name}.`)
      addFloatingText('Too much 💸', player.x, player.y - 6)
      return
    }

    const matchingShelf = shelves.find((shelf) => shelf.productId === productId)
    if (!matchingShelf || matchingShelf.stock <= 0) {
      setMessage(`${product.name} is out of stock.`)
      addFloatingText('Sold out', player.x, player.y - 6)
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

    setScore((prev) => prev + Math.round(product.price * 9))
    setMessage(`${product.name} added to cart.`)
    addFloatingText(`${product.emoji} +1`, player.x + 2, player.y - 10)
  }

  function interact() {
    if (gameOver) return

    if (distanceTo(cartZone) <= INTERACT_DISTANCE && !hasCart) {
      setHasCart(true)
      setMessage('Cart unlocked. Roll into glory 🛒')
      addFloatingText('Cart +1', cartZone.x + 5, cartZone.y - 8)
      return
    }

    if (distanceTo(checkoutZone) <= INTERACT_DISTANCE) {
      if (!hasCart) {
        setMessage('You need a cart before checkout.')
        return
      }
      if (!allGoalsMet) {
        setMessage('You still need the goal items before checkout.')
        return
      }
      if (totalItems === 0) {
        setMessage('Your cart is empty.')
        return
      }

      setScore((prev) => prev + 150 + timeLeft * 3 + gracePoints * 10)
      setWon(true)
      setGameOver(true)
      setMessage('Checkout complete. Everyday low prices, legendary run ✅')
      addFloatingText('Paid!', checkoutZone.x + 24, checkoutZone.y - 10)
      return
    }

    const nearbyShelf = shelves.find((shelf) => distanceTo(shelf) <= INTERACT_DISTANCE)
    if (nearbyShelf) {
      addToCart(nearbyShelf.productId)
      return
    }

    if (distanceTo(exitZone) <= INTERACT_DISTANCE) {
      setMessage('That exit is for champions after checkout.')
      return
    }

    setMessage('Move near a cart, shelf, or checkout then press interact.')
  }

  function giveThanks() {
    if (gameOver) return

    const bonus = Math.min(3, 1 + Math.floor(gracePoints / 3))
    setGracePoints((prev) => prev + 1)
    setBudget((prev) => prev + 0.25)
    setScore((prev) => prev + 20 * bonus)
    setMessage('A tiny thank you ripples through the store. Budget +$0.25 💛')
    addFloatingText('Thankx +', player.x + 4, player.y - 10)
  }

  function resetGame() {
    setPlayer({ x: 60, y: 450 })
    setHasCart(false)
    setBudget(25)
    setTimeLeft(75)
    setScore(0)
    setGracePoints(0)
    setMessage('Fresh run. Thankx Mart is open again.')
    setGameOver(false)
    setWon(false)
    setShelves(INITIAL_SHELVES)
    setCart([])
    setFloatingTexts([])
  }

  async function shareScore() {
    const shareText = `I scored ${score} at Thankx Mart 🛒🔥 Try it on OnlyThankx!`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Thankx Mart',
          text: shareText,
          url: '/thankx-mart',
        })
        return
      } catch {
        // do nothing
      }
    }

    try {
      await navigator.clipboard.writeText(shareText)
      alert('Score copied! Share it 😎')
    } catch {
      alert(shareText)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-amber-50 p-4 text-slate-800 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1.25fr_380px]">
          <div className="rounded-3xl border border-orange-100 bg-white/80 p-5 shadow-[0_20px_60px_rgba(251,146,60,0.12)] backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-orange-600">Thankx Mart</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Cozy store-runner inspired by your sketch. Everyday low prices. Tiny arcade heartbeat. 🛒
                </p>
              </div>

              <button
                onClick={resetGame}
                className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:scale-[1.02]"
              >
                Reset Game
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-orange-50 p-3">
                <div className="text-xs font-semibold uppercase text-slate-500">Budget</div>
                <div className="mt-1 text-2xl font-black text-orange-600">{formatMoney(budget)}</div>
              </div>

              <div className="rounded-2xl bg-amber-50 p-3">
                <div className="text-xs font-semibold uppercase text-slate-500">Spent</div>
                <div className="mt-1 text-2xl font-black text-amber-600">{formatMoney(totalSpent)}</div>
              </div>

              <div className="rounded-2xl bg-rose-50 p-3">
                <div className="text-xs font-semibold uppercase text-slate-500">Time</div>
                <div className="mt-1 text-2xl font-black text-rose-600">{timeLeft}s</div>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-3">
                <div className="text-xs font-semibold uppercase text-slate-500">Score</div>
                <div className="mt-1 text-2xl font-black text-emerald-600">{score}</div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-100 to-amber-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {THANKX_LINES[thankIndex]}
            </div>
          </div>

          <div className="rounded-3xl border border-orange-100 bg-white/80 p-5 shadow-[0_20px_60px_rgba(251,146,60,0.12)] backdrop-blur">
            <h2 className="text-xl font-black text-slate-800">How to play</h2>

            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                Move with <span className="font-bold text-slate-800">W A S D</span> or arrow keys.
              </p>
              <p>
                Press <span className="font-bold text-slate-800">Space</span> or{' '}
                <span className="font-bold text-slate-800">Enter</span> to interact.
              </p>
              <p>
                Press <span className="font-bold text-slate-800">T</span> to give thanks and earn a tiny bonus.
              </p>
              <p>
                On mobile, use the touch controls at the bottom right.
              </p>
              <p>
                Grab the cart, collect <span className="font-bold text-slate-800">Cookies</span>,{' '}
                <span className="font-bold text-slate-800">Cupcakes</span>, and{' '}
                <span className="font-bold text-slate-800">Honey Bun</span>, then checkout.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="font-semibold text-slate-500">Store message</div>
              <div className="mt-2 font-medium text-slate-800">{message}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="overflow-hidden rounded-[28px] border border-orange-100 bg-white p-3 shadow-[0_20px_60px_rgba(251,146,60,0.12)]">
            <div
              className="relative overflow-hidden rounded-[24px] border border-orange-100 bg-[linear-gradient(180deg,#fffdf8_0%,#fff5ec_100%)]"
              style={{ width: '100%', maxWidth: GRID_W, height: GRID_H }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(14,165,233,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,165,233,0.14) 1px, transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              />

              <div className="absolute left-0 top-0 h-full w-[120px] border-r-4 border-dashed border-orange-200/70 bg-orange-50/40" />

              <div
                className="absolute flex flex-col items-center justify-center rounded-3xl border-2 border-emerald-300 bg-emerald-50 text-center font-black text-emerald-700"
                style={{ left: entrance.x, top: entrance.y, width: entrance.w, height: entrance.h }}
              >
                <span className="text-lg">ENTRY</span>
                <span className="text-4xl">🧍</span>
              </div>

              <div
                className="absolute flex flex-col items-center justify-center rounded-3xl border-2 border-sky-300 bg-sky-50 text-center font-black text-sky-700"
                style={{ left: exitZone.x, top: exitZone.y, width: exitZone.w, height: exitZone.h }}
              >
                <span className="text-lg">EXIT</span>
                <span className="text-4xl">🚪</span>
              </div>

              <div
                className="absolute rounded-[26px] border-4 border-slate-300 bg-slate-100"
                style={{ left: cartZone.x, top: cartZone.y, width: cartZone.w, height: cartZone.h }}
              >
                <div className="flex h-full items-center justify-center text-3xl">🛒</div>
              </div>

              <div
                className="absolute rounded-[30px] border-4 border-stone-300 bg-stone-100 shadow-inner"
                style={{ left: checkoutZone.x, top: checkoutZone.y, width: checkoutZone.w, height: checkoutZone.h }}
              >
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Checkout</div>
                  <div className="mt-2 text-5xl">💳</div>
                </div>
              </div>

              {shelves.map((shelf) => {
                const product = PRODUCTS[shelf.productId]

                return (
                  <div
                    key={shelf.id}
                    className={`absolute rounded-[26px] border-2 border-orange-200 bg-gradient-to-br ${product.color} p-2 shadow`}
                    style={{ left: shelf.x, top: shelf.y, width: shelf.w, height: shelf.h }}
                  >
                    <div className="rounded-xl bg-white/75 px-2 py-1 text-center text-xs font-black text-slate-700">
                      {product.name} {formatMoney(product.price)}
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-1 text-center text-lg leading-none">
                      {Array.from({ length: Math.max(shelf.stock, 0) }).map((_, index) => (
                        <span key={index}>{product.emoji}</span>
                      ))}
                    </div>
                  </div>
                )
              })}

              <div
                className="absolute flex items-center justify-center rounded-full border-4 border-orange-500 bg-white text-xl shadow-[0_12px_30px_rgba(249,115,22,0.25)] transition-all"
                style={{ left: player.x, top: player.y, width: PLAYER_SIZE, height: PLAYER_SIZE }}
              >
                {hasCart ? '🧍🛒' : '🧍'}
              </div>

              {floatingTexts.map((item) => (
                <div
                  key={item.id}
                  className="pointer-events-none absolute animate-pulse text-sm font-black text-orange-600"
                  style={{ left: item.x, top: item.y }}
                >
                  {item.text}
                </div>
              ))}

              {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <div className="rounded-[28px] border border-orange-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(251,146,60,0.16)]">
                    <div className="text-5xl">{won ? '🏆' : '⏰'}</div>

                    <h3 className="mt-3 text-3xl font-black text-slate-800">
                      {won ? 'Checkout Complete!' : 'Run Over'}
                    </h3>

                    <p className="mt-2 text-slate-600">
                      {won ? 'You conquered Thankx Mart.' : 'Try another lap through the aisles.'}
                    </p>

                    <div className="mt-4 text-lg font-bold text-orange-600">Final Score: {score}</div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <button
                        onClick={resetGame}
                        className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]"
                      >
                        Play Again
                      </button>

                      <button
                        onClick={shareScore}
                        className="rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white shadow transition hover:scale-[1.02]"
                      >
                        Share Score 📤
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_20px_60px_rgba(251,146,60,0.12)]">
              <h3 className="text-xl font-black text-slate-800">Goal items</h3>

              <div className="mt-4 space-y-3">
                {objectiveProgress.map((goal) => {
                  const product = PRODUCTS[goal.productId]

                  return (
                    <div key={goal.productId} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{product.emoji}</span>
                        <div>
                          <div className="font-bold text-slate-800">{product.name}</div>
                          <div className="text-xs text-slate-500">Need {goal.qty}</div>
                        </div>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          goal.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {goal.found}/{goal.qty}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-[0_20px_60px_rgba(251,146,60,0.12)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800">Your cart</h3>
                <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                  {totalItems} items
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Your cart is empty.</div>
                ) : (
                  cart.map((item) => {
                    const product = PRODUCTS[item.productId]

                    return (
                      <div key={item.productId} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{product.emoji}</span>
                          <div>
                            <div className="font-bold text-slate-800">{product.name}</div>
                            <div className="text-xs text-slate-500">{formatMoney(product.price)} each</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-slate-800">x{item.qty}</div>
                          <div className="text-xs text-slate-500">{formatMoney(product.price * item.qty)}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-orange-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-black text-slate-800">{formatMoney(totalSpent)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">Grace points</span>
                  <span className="font-black text-slate-800">{gracePoints}</span>
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

        <div className="fixed bottom-6 right-6 z-50 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <button
            onClick={() => movePlayer(0, -20)}
            className="rounded-2xl bg-orange-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬆️
          </button>
          <div />

          <button
            onClick={() => movePlayer(-20, 0)}
            className="rounded-2xl bg-orange-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬅️
          </button>

          <button
            onClick={interact}
            className="rounded-2xl bg-emerald-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            🛒
          </button>

          <button
            onClick={() => movePlayer(20, 0)}
            className="rounded-2xl bg-orange-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ➡️
          </button>

          <div />
          <button
            onClick={() => movePlayer(0, 20)}
            className="rounded-2xl bg-orange-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            ⬇️
          </button>
          <button
            onClick={giveThanks}
            className="rounded-2xl bg-pink-500 p-3 text-xl text-white shadow-lg active:scale-95"
          >
            💛
          </button>
        </div>
      </div>
    </div>
  )
}