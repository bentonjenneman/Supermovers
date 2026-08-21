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

  // All queries run in parallel using simple selects — no relational FK syntax
  // so this works regardless of whether FK relationships are registered in
  // Supabase's schema cache.
  const [
    { count: totalSessions, error: e1 },
    { count: totalPageviews, error: e2 },
    { data: recentSessions, error: e3 },
    { data: pageviewRows, error: e4 },
    { data: quoteRows, error: e5 },
    { data: reviewRows, error: e6 },
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
      .select(
        'id, landing_page, referrer, user_agent, approx_city, approx_region, last_seen_at, created_at',
      )
      .order('last_seen_at', { ascending: false })
      .limit(200),
    // Pageview rows for the last 30 days — aggregated in JS below
    supabase
      .from('pageviews')
      .select('session_id')
      .gte('viewed_at', thirtyDaysAgo),
    // All quotes with a session link (small table)
    supabase.from('quotes').select('session_id').not('session_id', 'is', null),
    // All reviews with a session link (small table)
    supabase.from('reviews').select('session_id').not('session_id', 'is', null),
  ])

  if (e1) console.error('[tracking] sessions count error:', e1)
  if (e2) console.error('[tracking] pageviews count error:', e2)
  if (e3) console.error('[tracking] recent sessions error:', e3)
  if (e4) console.error('[tracking] pageview rows error:', e4)
  if (e5) console.error('[tracking] quote rows error:', e5)
  if (e6) console.error('[tracking] review rows error:', e6)

  // Build per-session pageview counts
  const pageviewMap = new Map<string, number>()
  for (const row of pageviewRows ?? []) {
    const sid = row.session_id as string | null
    if (sid) pageviewMap.set(sid, (pageviewMap.get(sid) ?? 0) + 1)
  }

  // Build sets of session IDs that have a quote / review
  const quoteSessionIds = new Set(
    (quoteRows ?? [])
      .map((r) => r.session_id as string | null)
      .filter((id): id is string => Boolean(id)),
  )
  const reviewSessionIds = new Set(
    (reviewRows ?? [])
      .map((r) => r.session_id as string | null)
      .filter((id): id is string => Boolean(id)),
  )

  // Assemble sessions with the same shape TrackingDashboard expects
  const sessions: SessionWithCounts[] = (recentSessions ?? []).map((s) => {
    const sid = s.id as string
    return {
      id: sid,
      landing_page: s.landing_page as string,
      referrer: s.referrer as string | null,
      user_agent: s.user_agent as string | null,
      approx_city: s.approx_city as string | null,
      approx_region: s.approx_region as string | null,
      last_seen_at: s.last_seen_at as string,
      created_at: s.created_at as string,
      pageviews: [{ count: pageviewMap.get(sid) ?? 0 }],
      quotes: [{ count: quoteSessionIds.has(sid) ? 1 : 0 }],
      reviews: [{ count: reviewSessionIds.has(sid) ? 1 : 0 }],
    }
  })

  const conversions = sessions.filter(
    (s) => s.quotes[0].count > 0 || s.reviews[0].count > 0,
  ).length

  return {
    summary: {
      totalSessions: e1 ? null : (totalSessions ?? 0),
      totalPageviews: e2 ? null : (totalPageviews ?? 0),
      conversions,
    },
    sessions,
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
