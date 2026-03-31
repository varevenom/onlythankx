export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <img src="/logo.png" alt="OnlyThankx" className="h-10 w-auto" />
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-gray-700">Login</button>
          <button className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white">
            Get Started
          </button>
        </div>
      </div>

      <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
          Share gratitude.
          <br />
          Feel connected.
        </h1>

        <p className="mb-8 max-w-2xl text-lg text-gray-600">
          A social space where people express appreciation, positivity, and real
          moments that matter.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button className="rounded-full bg-orange-500 px-6 py-3 text-lg font-semibold text-white">
            Get Started
          </button>
          <button className="rounded-full border border-gray-300 px-6 py-3 text-lg font-semibold text-gray-800">
            Login
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-20">
        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">@john_doe</div>
          <p className="mt-2 text-gray-700">Grateful for small wins today 🙏</p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-500">
            <span>✌️ Thanks 12</span>
            <span>Welcome</span>
            <span>Happy Share</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">@jane</div>
          <p className="mt-2 text-gray-700">
            Thankful for friends and good vibes ✨
          </p>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-500">
            <span>✌️ Thanks 8</span>
            <span>Welcome</span>
            <span>Happy Share</span>
          </div>
        </div>
      </section>
    </main>
  );
}