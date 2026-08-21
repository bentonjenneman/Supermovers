import { unstable_noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import QuotesTable from '@/components/admin/QuotesTable'

export const dynamic = 'force-dynamic'

export interface Quote {
  id: string
  session_id: string | null
  name: string
  email: string
  phone: string
  move_date: string | null
  origin_address: string | null
  destination_address: string | null
  move_size: string | null
  notes: string | null
  status: string
  created_at: string
}

async function getQuotes(): Promise<Quote[]> {
  unstable_noStore()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/quotes] Failed to fetch quotes:', error)
    return []
  }

  return (data ?? []) as Quote[]
}

export default async function QuotesPage() {
  const quotes = await getQuotes()
  return (
    <main>
      <h1>Quotes</h1>
      <QuotesTable initialQuotes={quotes} />
    </main>
  )
}
