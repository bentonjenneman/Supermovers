'use client'

import Link from 'next/link'
import { useCookieConsent } from '@/lib/analytics/consent-context'
import Button from '@/components/ui/Button'

export default function CookieConsentBanner() {
  const { consent, setConsent } = useCookieConsent()

  if (consent !== 'unknown') return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-ink text-paper px-4 py-4 md:py-3">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 max-w-5xl mx-auto">
        <p className="font-body text-sm text-center md:text-left">
          We use cookies to understand site traffic and improve your experience.{' '}
          <Link
            href="/privacy-policy"
            className="text-brand-orange underline hover:text-white"
          >
            Privacy Policy
          </Link>
        </p>
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="primary" onClick={() => setConsent('accepted')}>
            Accept
          </Button>
          <button
            onClick={() => setConsent('declined')}
            className="font-body text-sm text-paper/70 hover:text-paper underline-offset-2 hover:underline bg-transparent"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  )
}
