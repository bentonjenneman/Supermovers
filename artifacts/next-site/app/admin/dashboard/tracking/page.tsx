import { createAdminClient } from '@/lib/supabase/admin'
import TrackingDashboard from '@/components/admin/TrackingDashboard'

export const dynamic = 'force-dynamic'

export interface SessionWithCounts {
  id: string
  landing_page: string
  referrer: string | null
  user_agent: string | null
  approx_city: string | null
  approx_region: string | null
  last_seen_at: string
  created_at: string
  pageviews: { count: number }[]
  quotes: { count: number }[]
  reviews: { count: number }[]
}

export interface TrackingSummary {
  totalSessions: number | null
  totalPageviews: number | null
  conversions: number
}

async function getTrackingData(): Promise<{
  summary: TrackingSummary
  sessions: SessionWithCounts[]
}> {
  const supabase = createAdminClient()
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString()

  const [
    { count: totalSessions, error: e1 },
    { count: totalPageviews, error: e2 },
    { data: conversionSessions, error: e3 },
    { data: recentSessions, error: e4 },
  ] = await Promise.all([
    supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', thirtyDaysAgo),
    supabase
      .from('pageviews')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', thirtyDaysAgo),
    supabase
      .from('sessions')
      .select('id, quotes(count), reviews(count)')
      .gte('last_seen_at', thirtyDaysAgo),
    supabase
      .from('sessions')
      .select('*, pageviews(count), quotes(count), reviews(count)')
      .order('last_seen_at', { ascending: false })
      .limit(200),
  ])

  if (e1) console.error('[tracking] sessions count error:', e1)
  if (e2) console.error('[tracking] pageviews count error:', e2)
  if (e3) console.error('[tracking] conversion sessions error:', e3)
  if (e4) console.error('[tracking] recent sessions error:', e4)

  const conversions = (conversionSessions ?? []).filter((s) => {
    const q = (s.quotes as { count: number }[] | null)?.[0]?.count ?? 0
    const r = (s.reviews as { count: number }[] | null)?.[0]?.count ?? 0
    return q > 0 || r > 0
  }).length

  return {
    summary: {
      totalSessions: e1 ? null : (totalSessions ?? 0),
      totalPageviews: e2 ? null : (totalPageviews ?? 0),
      conversions,
    },
    sessions: (recentSessions ?? []) as SessionWithCounts[],
  }
}

export default async function TrackingPage() {
  const { summary, sessions } = await getTrackingData()

  return (
    <main>
      <h1>Tracking</h1>
      <TrackingDashboard summary={summary} sessions={sessions} />
    </main>
  )
}
