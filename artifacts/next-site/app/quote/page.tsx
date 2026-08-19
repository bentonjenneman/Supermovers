import type { Metadata } from 'next'
import QuotePageClient from './QuotePageClient'

export const metadata: Metadata = {
  title: 'Get a Free Quote | Super Movers',
  description: 'Request a free, no-obligation moving quote from Super Movers in Athens, GA.',
}

export default function GetAQuote() {
  return <QuotePageClient />
}