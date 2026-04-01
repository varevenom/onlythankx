import './globals.css'

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
        {/* AdSense Verification Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5294118103701735"
          crossOrigin="anonymous"
        ></script>
      </head>

      <body>{children}</body>
    </html>
  )
}