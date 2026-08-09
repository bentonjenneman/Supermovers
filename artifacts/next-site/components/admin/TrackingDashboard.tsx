'use client'

import { parseUserAgent } from '@/lib/analytics/parse-user-agent'
import type {
  SessionWithCounts,
  TrackingSummary,
} from '@/app/admin/dashboard/tracking/page'

function formatLocation(city: string | null, region: string | null): string {
  if (city && region) return `${city}, ${region}`
  if (city) return city
  if (region) return region
  return 'Unknown'
}

export default function TrackingDashboard({
  summary,
  sessions,
}: {
  summary: TrackingSummary
  sessions: SessionWithCounts[]
}) {
  return (
    <>
      {/* Summary stat cards */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <StatCard label="Sessions (30d)" value={summary.totalSessions} />
        <StatCard label="Pageviews (30d)" value={summary.totalPageviews} />
        <StatCard label="Conversions (30d)" value={summary.conversions} />
      </div>


      {/* Session table */}
      {sessions.length === 0 ? (
        <p>No visitor activity yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Last seen</th>
                <th>Location</th>
                <th>Referrer</th>
                <th>Device</th>
                <th>Browser</th>
                <th>Pageviews</th>
                <th>Converted</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const { device, browser } = parseUserAgent(s.user_agent)
                const pageviewCount = s.pageviews?.[0]?.count ?? 0
                const quoteCount = s.quotes?.[0]?.count ?? 0
                const reviewCount = s.reviews?.[0]?.count ?? 0
                const converted = quoteCount > 0 || reviewCount > 0

                return (
                  <tr key={s.id}>
                    <td>{new Date(s.last_seen_at).toLocaleString()}</td>
                    <td>{formatLocation(s.approx_city, s.approx_region)}</td>
                    <td>{s.referrer ?? 'Direct'}</td>
                    <td>{device}</td>
                    <td>{browser}</td>
                    <td>{pageviewCount}</td>
                    <td>{converted ? '✓' : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function StatCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div style={{ minWidth: '140px' }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {value === null ? '—' : value}
      </div>
      {value === null ? (
        <div style={{ fontSize: '0.8rem', color: 'red' }}>(failed to load)</div>
      ) : (
        <div style={{ fontSize: '0.9rem' }}>{label}</div>
      )}
    </div>
  )
}
