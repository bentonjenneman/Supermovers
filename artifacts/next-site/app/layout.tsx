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
  title: 'Super Movers | Athens, GA Moving, Delivery, and Junk Removal',
  description: 'Athens, GA movers offering local and long-distance moving, delivery, and Junk Removal. Free quotes, no hidden fees, up to 200 miles.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-ink text-paper font-body">
        <CookieConsentProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': ['MovingCompany', 'LocalBusiness'],
                name: 'Super Movers',
                telephone: '+14705624020',
                areaServed: {
                  '@type': 'GeoCircle',
                  name: '200-mile radius of Athens, GA',
                  geoMidpoint: {
                    '@type': 'GeoCoordinates',
                    addressLocality: 'Athens',
                    addressRegion: 'GA',
                  },
                  geoRadius: '200 miles',
                },
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Athens',
                  addressRegion: 'GA',
                },
              }),
            }}
          />
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
