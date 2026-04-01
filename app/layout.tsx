import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://onlythankx.com'),
  title: 'OnlyThankx',
  description:
    'Share gratitude. Feel connected. A social space for appreciation, positivity, and real moments that matter.',
  openGraph: {
    title: 'OnlyThankx',
    description:
      'Share gratitude. Feel connected. A social space for appreciation, positivity, and real moments that matter.',
    url: 'https://onlythankx.com',
    siteName: 'OnlyThankx',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OnlyThankx',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnlyThankx',
    description:
      'Share gratitude. Feel connected. A social space for appreciation, positivity, and real moments that matter.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}