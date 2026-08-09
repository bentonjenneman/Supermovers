import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Poppins, Inter } from 'next/font/google'
import { CookieConsentProvider } from '@/lib/analytics/consent-context'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import PageviewTracker from '@/components/PageviewTracker'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'My Site',
  description: 'Welcome to my site',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-paper text-ink font-body">
        <CookieConsentProvider>
          <Header />
          {children}
          <Footer />
          <PageviewTracker />
          <CookieConsentBanner />
        </CookieConsentProvider>
      </body>
    </html>
  )
}
