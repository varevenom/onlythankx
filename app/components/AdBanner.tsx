'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdBanner({ adSlot }: { adSlot: string }) {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <div className="overflow-hidden rounded-[30px] border border-orange-100 bg-white p-4 shadow-[0_10px_30px_rgba(255,140,90,0.08)]">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
        Sponsored
      </p>

      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5294118103701735"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}