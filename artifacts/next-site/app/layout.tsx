import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { CookieConsentProvider } from '@/lib/analytics/consent-context'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import PageviewTracker from '@/components/PageviewTracker'
import './globals.css'

export const metadata: Metadata = {
  title: 'My Site',
  description: 'Welcome to my site',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CookieConsentProvider>
          <nav>
            <Link href="/">Home</Link>
            <Link href="/services">Services</Link>
            <Link href="/quote">Get a Quote</Link>
            <Link href="/about">About</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          {children}
          <footer>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms and Conditions</Link>
          </footer>
          <PageviewTracker />
          <CookieConsentBanner />
        </CookieConsentProvider>
      </body>
    </html>
  )
}
