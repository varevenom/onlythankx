export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-[0_10px_40px_rgba(255,140,90,0.08)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-orange-400">
          About
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          A softer place on the internet
        </h1>
        <p className="mt-4 text-[15px] leading-8 text-gray-600">
          OnlyThankx is a social space built around appreciation, gratitude, and
          meaningful presence. It is designed for people who want to share small
          wins, kind reflections, and moments that deserve warmth instead of noise.
        </p>
        <p className="mt-4 text-[15px] leading-8 text-gray-600">
          Our goal is simple: make online sharing feel lighter, calmer, and more
          human.
        </p>
      </section>
    </main>
  )
}