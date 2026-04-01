'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const previewPosts = [
  {
    id: '1',
    username: 'john_doe',
    content: 'Grateful for small wins today 🙏',
    thanks: 12,
    comments: 3,
    image: '/preview.png',
  },
  {
    id: '2',
    username: 'maya',
    content: 'Thankful for my mom calling at the right time 💛',
    thanks: 8,
    comments: 2,
    image: null,
  },
]

const features = [
  {
    title: 'Post beautiful gratitude',
    description:
      'Share small wins, thank-yous, life moments, and warm reflections in a clean, feel-good feed.',
  },
  {
    title: 'Welcome, not comments',
    description:
      'Conversations feel softer here. Respond with warmth, encouragement, and connection.',
  },
  {
    title: 'Happy Share',
    description:
      'Spread uplifting posts outside the app with simple sharing that keeps the mood bright.',
  },
]

function FadeUp({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,173,122,0.18),_transparent_30%),linear-gradient(to_bottom,_#fff8f5,_#fffaf8)] text-gray-900">
      <header className="sticky top-0 z-40 border-b border-orange-100/70 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.img
              whileHover={{ rotate: -4, scale: 1.04 }}
              src="/logo.png"
              alt="OnlyThankx"
              className="h-11 w-11 rounded-2xl object-cover ring-1 ring-orange-100 shadow-[0_8px_24px_rgba(255,140,90,0.18)]"
            />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">OnlyThankx</h1>
              <p className="text-xs text-gray-500">Share gratitude beautifully</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-gray-500 transition hover:text-gray-900">
              Features
            </a>
            <a href="#preview" className="text-sm text-gray-500 transition hover:text-gray-900">
              Preview
            </a>
            <a href="#join" className="text-sm text-gray-500 transition hover:text-gray-900">
              Join
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/signup"
                className="rounded-full bg-[#ff8e66] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,140,90,0.24)] transition"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.08fr_0.92fr] md:py-20">
        <FadeUp>
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-orange-100 bg-white/90 px-3 py-1 text-sm text-gray-600 shadow-sm">
              ✨ A softer social space for appreciation
            </div>

            <h2 className="max-w-3xl text-5xl font-semibold tracking-tight text-gray-950 md:text-7xl md:leading-[1.02]">
              Share gratitude.
              <br />
              Feel connected.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              A social space where people express appreciation, positivity, and real
              moments that matter. Less noise. More heart.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#ff8e66] px-6 py-3 text-base font-semibold text-white shadow-[0_14px_36px_rgba(255,140,90,0.28)] transition"
                >
                  Start Posting
                </Link>
              </motion.div>

              <Link
                href="/login"
                className="rounded-full border border-orange-100 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                Login
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm text-gray-500">
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-orange-100">
                ✌️ Thanks instead of likes
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-orange-100">
                💬 Welcome instead of comments
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-orange-100">
                🌍 Happy Share spreads good energy
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-rose-200/30 blur-3xl" />

            <motion.div
              whileHover={{ y: -4 }}
              className="relative rounded-[34px] border border-orange-100 bg-white/95 p-4 shadow-[0_24px_70px_rgba(255,140,90,0.14)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="OnlyThankx"
                  className="h-12 w-12 rounded-2xl object-cover"
                />
                <div>
                  <p className="font-semibold tracking-tight">OnlyThankx</p>
                  <p className="text-sm text-gray-500">A cleaner feed for gratitude</p>
                </div>
              </div>

              <div className="rounded-[26px] border border-orange-100 bg-[#fffaf8] p-4">
                <div className="mb-3 flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="avatar"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">@yourname</p>
                    <p className="text-sm text-gray-500">What made today lighter?</p>
                  </div>
                </div>

                <div className="rounded-[22px] bg-white px-4 py-5 text-gray-400 ring-1 ring-orange-100">
                  Share a grateful moment...
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <div className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm text-gray-600">
                      📷 Add Photo
                    </div>
                    <div className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm text-gray-400">
                      🎥 Add Video
                    </div>
                  </div>

                  <div className="rounded-full bg-[#ff8e66] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,140,90,0.22)]">
                    Post Thanks
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {previewPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.1 * i }}
                    className="overflow-hidden rounded-[26px] border border-orange-100 bg-[#fffdfc]"
                  >
                    <div className="p-4">
                      <div className="mb-3 flex items-center gap-3">
                        <img
                          src="/logo.png"
                          alt="avatar"
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">@{post.username}</p>
                          <p className="text-xs text-gray-400">Just now</p>
                        </div>
                      </div>

                      <p className="text-[15px] leading-7 text-gray-700">{post.content}</p>
                    </div>

                    {post.image && (
                      <div className="border-y border-orange-100 bg-[#fffaf8]">
                        <img
                          src={post.image}
                          alt="post preview"
                          className="max-h-[330px] w-full object-contain"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 p-4">
                      <div className="rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-gray-700">
                        ✌️ Thanks
                      </div>
                      <span className="text-sm text-gray-500">{post.thanks}</span>

                      <div className="rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                        Welcome
                      </div>
                      <span className="text-sm text-gray-500">{post.comments}</span>

                      <div className="rounded-full bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                        Happy Share
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-4 md:py-10">
        <FadeUp>
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-orange-500">
              Why it feels different
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Built for warmth, not noise
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-gray-500">
              OnlyThankx keeps the social feeling, but swaps tension and clutter for
              appreciation, softness, and real presence.
            </p>
          </div>
        </FadeUp>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, i) => (
            <FadeUp key={feature.title} delay={0.08 * i}>
              <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-[0_12px_34px_rgba(255,140,90,0.07)] transition hover:-translate-y-1">
                <h4 className="text-xl font-semibold tracking-tight">{feature.title}</h4>
                <p className="mt-3 leading-7 text-gray-500">{feature.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section id="preview" className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <FadeUp>
            <div className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_12px_34px_rgba(255,140,90,0.06)]">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-orange-500">
                Post softly
              </p>
              <h4 className="mt-3 text-3xl font-semibold tracking-tight">
                Small moments deserve a place too.
              </h4>
              <p className="mt-4 leading-8 text-gray-500">
                Not every post has to perform. Share the tiny things: a kind text, a
                peaceful walk, a friend who showed up, a breath that felt easier.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="rounded-[32px] border border-orange-100 bg-[#fffaf8] p-8 shadow-[0_12px_34px_rgba(255,140,90,0.06)]">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-orange-500">
                Stay longer
              </p>
              <h4 className="mt-3 text-3xl font-semibold tracking-tight">
                A feed that feels gentle on the mind.
              </h4>
              <p className="mt-4 leading-8 text-gray-500">
                Cleaner cards, simpler actions, warmer energy. OnlyThankx is built to
                feel calm enough to browse and alive enough to come back.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section id="join" className="mx-auto max-w-4xl px-4 py-10 pb-28 md:pb-14">
        <FadeUp>
          <div className="rounded-[34px] border border-orange-100 bg-white px-6 py-10 text-center shadow-[0_20px_60px_rgba(255,140,90,0.10)] md:px-12">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-orange-500">
              Join the vibe
            </p>

            <h3 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              A little more gratitude.
              <br />
              A lot less noise.
            </h3>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-500">
              Start posting moments that feel real. Build a feed that reminds people
              what still feels good.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="rounded-full bg-[#ff8e66] px-6 py-3 text-base font-semibold text-white shadow-[0_14px_36px_rgba(255,140,90,0.22)]"
                >
                  Create Account
                </Link>
              </motion.div>

              <Link
                href="/login"
                className="rounded-full border border-orange-100 bg-white px-6 py-3 text-base font-medium text-gray-700 transition hover:-translate-y-[1px] hover:shadow-sm"
              >
                Login
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      <footer className="border-t border-orange-100 bg-white/70 pb-24 md:pb-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 OnlyThankx. Share gratitude beautifully.</p>
          <div className="flex gap-4">
            <Link href="/signup" className="transition hover:text-gray-900">
              Get Started
            </Link>
            <Link href="/login" className="transition hover:text-gray-900">
              Login
            </Link>
            <Link href="/feed" className="transition hover:text-gray-900">
              Feed
            </Link>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-orange-100 bg-white/90 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          <a
            href="/"
            className="rounded-2xl px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-orange-50"
          >
            🏠
            <div className="mt-1">Home</div>
          </a>
          <a
            href="#features"
            className="rounded-2xl px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-orange-50"
          >
            ✨
            <div className="mt-1">Features</div>
          </a>
          <a
            href="/login"
            className="rounded-2xl px-3 py-2 text-center text-xs font-medium text-gray-700 transition hover:bg-orange-50"
          >
            🔐
            <div className="mt-1">Login</div>
          </a>
          <a
            href="/signup"
            className="rounded-2xl bg-[#ff8e66] px-3 py-2 text-center text-xs font-semibold text-white shadow-sm"
          >
            🚀
            <div className="mt-1">Join</div>
          </a>
        </div>
      </div>
    </main>
  )
}