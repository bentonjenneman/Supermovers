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
      {/* Stat cards */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        <StatCard label="Sessions (30d)" value={summary.totalSessions} />
        <StatCard label="Pageviews (30d)" value={summary.totalPageviews} />
        <StatCard label="Conversions (30d)" value={summary.conversions} />
      </div>

      {/* Session table */}
      {sessions.length === 0 ? (
        <p className="font-body text-ink-muted text-center py-12">No visitor activity yet.</p>
      ) : (
        <div className="bg-surface rounded-lg border border-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-ink">
                {['Last seen', 'Location', 'Referrer', 'Device', 'Browser', 'Pageviews', 'Converted'].map(
                  (h) => (
                    <th
                      key={h}
                      className="font-body font-semibold text-xs text-ink-muted uppercase tracking-wide text-left px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => {
                const { device, browser } = parseUserAgent(s.user_agent)
                const pageviewCount = s.pageviews?.[0]?.count ?? 0
                const quoteCount = s.quotes?.[0]?.count ?? 0
                const reviewCount = s.reviews?.[0]?.count ?? 0
                const converted = quoteCount > 0 || reviewCount > 0

                return (
                  <tr
                    key={s.id}
                    className={`border-t border-border hover:bg-white/5 transition-colors ${
                      i % 2 === 1 ? 'bg-ink/40' : 'bg-surface'
                    }`}
                  >
                    <td
                      className="px-4 py-3 font-body text-sm text-paper whitespace-nowrap"
                      suppressHydrationWarning
                    >
                      {new Date(s.last_seen_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-paper">
                      {formatLocation(s.approx_city, s.approx_region)}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-paper max-w-[180px] truncate" title={s.referrer ?? 'Direct'}>
                      {s.referrer ?? 'Direct'}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-paper">{device}</td>
                    <td className="px-4 py-3 font-body text-sm text-paper">{browser}</td>
                    <td className="px-4 py-3 font-body text-sm text-paper">{pageviewCount}</td>
                    <td className="px-4 py-3">
                      {converted ? (
                        <span className="bg-brand-blue text-white rounded-full px-2 py-0.5 text-xs font-bold">
                          Yes
                        </span>
                      ) : (
                        <span className="text-ink-muted/50 text-xs">—</span>
                      )}
                    </td>
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
    <div className="bg-surface border border-border rounded-lg p-4 sm:p-5">
      <div className="font-body text-xs text-ink-muted uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="font-heading font-bold text-paper text-3xl">
        {value === null ? '—' : value}
      </div>
      {value === null && (
        <div className="text-xs text-ink-muted/60 mt-1">(failed to load)</div>
      )}
    </div>
  )
}
