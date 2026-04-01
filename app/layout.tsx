import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'OnlyThankx',
  description: 'Share gratitude beautifully',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fff7f4] text-gray-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>

          <footer className="relative overflow-hidden border-t border-orange-100/80 bg-white/90 backdrop-blur-xl">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,167,121,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,205,178,0.18),transparent_30%)]" />

            <div className="relative mx-auto max-w-6xl px-4 py-10">
              <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="OnlyThankx"
                      className="h-12 w-12 rounded-2xl object-cover ring-1 ring-orange-100"
                    />
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">OnlyThankx</h2>
                      <p className="text-sm text-gray-500">
                        Share gratitude beautifully
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 max-w-md text-sm leading-7 text-gray-600">
                    A softer social space for appreciation, warmth, and meaningful
                    moments. Less noise. More heart.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Explore
                  </h3>
                  <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
                    <Link href="/" className="transition hover:text-gray-900">
                      Home
                    </Link>
                    <Link href="/feed" className="transition hover:text-gray-900">
                      Feed
                    </Link>
                    <Link href="/profile" className="transition hover:text-gray-900">
                      Profile
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Legal
                  </h3>
                  <div className="mt-4 flex flex-col gap-3 text-sm text-gray-600">
                    <Link href="/about" className="transition hover:text-gray-900">
                      About
                    </Link>
                    <Link href="/privacy" className="transition hover:text-gray-900">
                      Privacy
                    </Link>
                    <Link href="/terms" className="transition hover:text-gray-900">
                      Terms
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-orange-100/80 pt-6 text-xs text-gray-400 md:flex-row md:items-center md:justify-between">
                <p>© {new Date().getFullYear()} OnlyThankx. All rights reserved.</p>
                <p>Built for gratitude, softness, and real presence.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}