import type { Metadata } from 'next'
import { findService } from '@/lib/service-cards'
import QuotePageClient from './QuotePageClient'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Get Your Super Quote | SuperMovers',
  description: 'Request a free, no-obligation moving quote from SuperMovers in Athens, GA.',
}

export default function GetAQuote({ searchParams }: { searchParams: { service?: string | string[] } }) {
  const initialMoveType = findService(searchParams.service)?.slug ?? ''
  return <QuotePageClient key={initialMoveType} initialMoveType={initialMoveType} />
}