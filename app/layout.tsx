import './globals.css'
import Script from 'next/script'

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
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5294118103701735"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body>{children}</body>
    </html>
  )
}