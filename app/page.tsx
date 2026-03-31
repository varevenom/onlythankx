import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fff8f2] text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="OnlyThankx"
              className="h-10 w-10 rounded-xl"
            />
            <div>
              <h1 className="text-lg font-bold">OnlyThankx</h1>
              <p className="text-xs text-gray-500">
                Share gratitude beautifully
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium">
            <Link href="/login" className="text-gray-600">
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-orange-500 px-4 py-2 text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="mx-auto max-w-2xl text-5xl font-bold leading-tight">
          Share gratitude.
          <br />
          Feel connected.
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          A social space where people express appreciation, positivity, and real
          moments that matter.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-orange-500 px-6 py-3 font-semibold text-white"
          >
            Get Started
          </Link>

          <Link
            href="/login"
            className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-800"
          >
            Login
          </Link>
        </div>

        <div className="mx-auto mt-14 max-w-2xl space-y-4 text-left">
          <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <p className="font-semibold">@john_doe</p>
            <p className="mt-2 text-gray-700">
              Grateful for small wins today 🙏
            </p>
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>✌️ Thanks 12</span>
              <span>Welcome</span>
              <span>Happy Share</span>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <p className="font-semibold">@jane</p>
            <p className="mt-2 text-gray-700">
              Thankful for friends and good vibes ✨
            </p>
            <div className="mt-3 flex gap-4 text-sm text-gray-500">
              <span>✌️ Thanks 8</span>
              <span>Welcome</span>
              <span>Happy Share</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}