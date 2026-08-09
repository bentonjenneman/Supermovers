'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCookieConsent } from '@/lib/analytics/consent-context'

export default function PageviewTracker() {
  const pathname = usePathname()
  const { consent } = useCookieConsent()

  useEffect(() => {
    if (consent !== 'accepted') return

    fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathname, referrer: document.referrer }),
    }).catch((err) => console.error('[analytics] pageview error:', err))
  }, [pathname, consent])

  return null
}
