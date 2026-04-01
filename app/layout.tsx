import './globals.css'
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
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
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5294118103701735"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body>
        {children}
      </body>
    </html>
  )
}