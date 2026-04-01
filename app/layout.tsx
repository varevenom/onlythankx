import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://onlythankx.com'),
  title: 'OnlyThankx',
  description: 'Share gratitude. Feel connected.',
  openGraph: {
    title: 'OnlyThankx',
    description: 'Share gratitude. Feel connected.',
    url: 'https://onlythankx.com',
    siteName: 'OnlyThankx',
    images: [
      {
        url: 'https://onlythankx.com/preview.png',
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
    description: 'Share gratitude. Feel connected.',
    images: ['https://onlythankx.com/preview.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}