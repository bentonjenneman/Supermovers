'use client'

import Link from 'next/link'
import { useCookieConsent } from '@/lib/analytics/consent-context'

export default function CookieConsentBanner() {
  const { consent, setConsent } = useCookieConsent()

  if (consent !== 'unknown') return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
        zIndex: 9999,
      }}
    >
      <p style={{ margin: 0, fontSize: '0.9rem' }}>
        We use cookies for analytics to understand how visitors use our site.{' '}
        <Link href="/privacy-policy" style={{ color: '#a0c4ff' }}>
          Privacy Policy
        </Link>
      </p>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => setConsent('accepted')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#fff',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Accept
        </button>
        <button
          onClick={() => setConsent('declined')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          Decline
        </button>
      </div>
    </div>
  )
}
