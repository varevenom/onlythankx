'use client'

import { useMemo, useState } from 'react'

type ProductId = 'cookies' | 'candles' | 'cakes' | 'cupcakes'

type Product = {
  id: ProductId
  name: string
  price: number
  color: string
  emoji: string
  thankYou: string
}

type CartItem = {
  productId: ProductId
  qty: number
}

const PRODUCTS: Record<ProductId, Product> = {
  cookies: {
    id: 'cookies',
    name: 'Cookies',
    price: 5,
    color: '#f59e0b',
    emoji: '🍪',
    thankYou: 'Thank the baker',
  },
  candles: {
    id: 'candles',
    name: 'Candles',
    price: 10,
    color: '#a3a3a3',
    emoji: '🕯️',
    thankYou: 'Thank the glow',
  },
  cakes: {
    id: 'cakes',
    name: 'Cakes',
    price: 15,
    color: '#fb7185',
    emoji: '🎂',
    thankYou: 'Thank the sweet moment',
  },
  cupcakes: {
    id: 'cupcakes',
    name: 'Cupcakes',
    price: 8,
    color: '#ec4899',
    emoji: '🧁',
    thankYou: 'Thank the tiny joy',
  },
}

const PRODUCT_ORDER: ProductId[] = ['cookies', 'candles', 'cakes', 'cupcakes']

export default function ThankxMartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState<ProductId>('cookies')
  const [message, setMessage] = useState('Welcome to Thankx Mart 💛')

  const selectedProduct = PRODUCTS[selectedProductId]

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0)
  }, [cart])

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      const product = PRODUCTS[item.productId]
      return sum + product.price * item.qty
    }, 0)
  }, [cart])

  const addToCart = (productId: ProductId) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId)

      if (existing) {
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }

      return [...prev, { productId, qty: 1 }]
    })

    setMessage(`${PRODUCTS[productId].name} added beautifully ✨`)
  }

  const decreaseQty = (productId: ProductId) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0)
    )

    setMessage(`One ${PRODUCTS[productId].name} removed`)
  }

  const clearCart = () => {
    setCart([])
    setMessage('Cart cleared 🧺')
  }

  const checkout = () => {
    if (cart.length === 0) {
      setMessage('Your cart is empty 🛒')
      return
    }

    setMessage('Thank the cashier. Thank the store. Tiny joy unlocked ✨')
    setCart([])
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff8f2_0%,#ffe9da_45%,#ffd4bf_100%)] px-4 py-5 text-[#442618]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(255,145,90,0.18)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff2ea] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#a75d3b]">
                🛒 Thankx Mart
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-5xl">
                Everyday low prices,
                <br />
                everyday tiny joy
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#7b4a34] md:text-base">
                Shop sweet little things. Fill your cart. Thank the baker, thank
                the store, thank the cashier.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:min-w-[260px]">
              <div className="rounded-[24px] bg-[#fff4ee] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#9f6b54]">
                  Items
                </div>
                <div className="mt-1 text-2xl font-extrabold">{totalItems}</div>
              </div>
              <div className="rounded-[24px] bg-[#fff4ee] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#9f6b54]">
                  Total
                </div>
                <div className="mt-1 text-2xl font-extrabold">${totalPrice}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-orange-100 bg-[#fff8f4] px-4 py-3 text-sm font-semibold text-[#8e5438]">
            {message}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(255,145,90,0.15)] backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold">Shop aisle</h2>
                <p className="text-sm text-[#7b4a34]">
                  Pick a treat and add it to cart.
                </p>
              </div>

              <div className="rounded-full bg-[#fff2ea] px-3 py-1 text-xs font-bold text-[#a75d3b]">
                Start simple
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PRODUCT_ORDER.map((productId) => {
                const product = PRODUCTS[productId]
                const active = selectedProductId === productId

                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    className={`group rounded-[28px] border p-5 text-left transition ${
                      active
                        ? 'border-orange-300 bg-[#fff8f1] shadow-[0_14px_35px_rgba(255,145,90,0.18)]'
                        : 'border-orange-100 bg-white hover:border-orange-200 hover:bg-[#fffaf6]'
                    }`}
                  >
                    <div
                      className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] text-3xl shadow-inner"
                      style={{ backgroundColor: product.color }}
                    >
                      {product.emoji}
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold">{product.name}</h3>
                        <p className="mt-1 text-sm text-[#7b4a34]">
                          {product.thankYou}
                        </p>
                      </div>
                      <div className="rounded-full bg-[#fff1e8] px-3 py-1 text-sm font-bold text-[#9a5638]">
                        ${product.price}
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(product.id)
                        }}
                        className="rounded-2xl bg-[#ff8f5a] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,143,90,0.35)] transition active:scale-95"
                      >
                        Add to cart
                      </button>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(255,145,90,0.15)] backdrop-blur">
            <div className="rounded-[28px] border border-orange-100 bg-[#fff8f1] p-5">
              <div
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] text-5xl shadow-inner"
                style={{ backgroundColor: selectedProduct.color }}
              >
                {selectedProduct.emoji}
              </div>

              <h2 className="mt-4 text-center text-2xl font-extrabold">
                {selectedProduct.name}
              </h2>
              <p className="mt-2 text-center text-sm text-[#7b4a34]">
                {selectedProduct.thankYou}
              </p>

              <div className="mt-4 text-center text-3xl font-extrabold">
                ${selectedProduct.price}
              </div>

              <button
                onClick={() => addToCart(selectedProduct.id)}
                className="mt-5 w-full rounded-[22px] bg-[#ff8f5a] px-5 py-3 font-bold text-white shadow-[0_12px_28px_rgba(255,143,90,0.35)] transition active:scale-95"
              >
                Add {selectedProduct.name}
              </button>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xl font-extrabold">Your cart</h3>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-sm font-bold text-[#b15b35]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-orange-200 bg-[#fffaf7] p-5 text-center text-sm text-[#8a5a44]">
                  Your cart is resting peacefully 🧺
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => {
                    const product = PRODUCTS[item.productId]

                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between rounded-[22px] bg-[#fff4ee] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                            style={{ backgroundColor: product.color }}
                          >
                            {product.emoji}
                          </div>

                          <div>
                            <div className="font-bold">{product.name}</div>
                            <div className="text-sm text-[#7b4a34]">
                              ${product.price} each
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQty(product.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-[#9a5638] shadow-sm"
                          >
                            -
                          </button>
                          <div className="min-w-[24px] text-center font-bold">
                            {item.qty}
                          </div>
                          <button
                            onClick={() => addToCart(product.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg font-bold text-[#9a5638] shadow-sm"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="mt-5 rounded-[24px] bg-[#fff8f4] p-4">
                <div className="flex items-center justify-between text-sm text-[#7b4a34]">
                  <span>Total items</span>
                  <span className="font-bold">{totalItems}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-lg">
                  <span className="font-bold">Total price</span>
                  <span className="text-2xl font-extrabold">${totalPrice}</span>
                </div>

                <button
                  onClick={checkout}
                  className="mt-4 w-full rounded-[22px] bg-[#ff8f5a] px-5 py-3 font-bold text-white shadow-[0_12px_28px_rgba(255,143,90,0.35)] transition active:scale-95"
                >
                  Checkout
                </button>

                <p className="mt-3 text-center text-xs text-[#8d614c]">
                  Thank the baker. Thank the store. Thank the cashier.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}