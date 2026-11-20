'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NETWORK, readError } from './google-reviews/utils'
import type { BadgeSettings } from '@/lib/home-badge-settings'
import type { BannerResult } from '@/lib/banner-settings'
import type { GoogleProfileStats } from '@/lib/google-reviews/types'
import BannerPanel from './BannerPanel'
import ProfilePanel from './google-reviews/ProfilePanel'
import GoogleReviewsBadge from '@/components/GoogleReviewsBadge'
import LeaveGoogleReviewBadge from '@/components/LeaveGoogleReviewBadge'

interface EditorPanelsProps {
  stats: BadgeSettings | null
  homeFlagsReady: boolean
  banner: BannerResult
  googleProfile: GoogleProfileStats | null
}

export default function EditorPanels({ stats, homeFlagsReady, banner, googleProfile }: EditorPanelsProps) {
  return (
    <div className="space-y-4 text-paper">
      <BadgesPanel stats={stats} homeFlagsReady={homeFlagsReady} googleProfile={googleProfile} />
      <BannerPanel settings={banner} />
    </div>
  )
}

function BadgesPanel({ stats, homeFlagsReady, googleProfile }: Omit<EditorPanelsProps, 'banner'>) {
  const router = useRouter()
  const [values, setValues] = useState<BadgeSettings>(() => stats ?? {
    badge_enabled: false, google_badge_enabled: false,
    show_satisfaction_badge_home: false, show_google_badge_home: false,
  })
  const baseline = useRef(values)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!stats) return
    const previous = baseline.current
    baseline.current = stats
    setValues((current) => ({
      badge_enabled: current.badge_enabled === previous.badge_enabled ? stats.badge_enabled : current.badge_enabled,
      google_badge_enabled: current.google_badge_enabled === previous.google_badge_enabled ? stats.google_badge_enabled : current.google_badge_enabled,
      show_satisfaction_badge_home: current.show_satisfaction_badge_home === previous.show_satisfaction_badge_home ? stats.show_satisfaction_badge_home : current.show_satisfaction_badge_home,
      show_google_badge_home: current.show_google_badge_home === previous.show_google_badge_home ? stats.show_google_badge_home : current.show_google_badge_home,
      show_leave_review_badge_home: current.show_leave_review_badge_home === previous.show_leave_review_badge_home ? stats.show_leave_review_badge_home : current.show_leave_review_badge_home,
      show_leave_review_badge_reviews: current.show_leave_review_badge_reviews === previous.show_leave_review_badge_reviews ? stats.show_leave_review_badge_reviews : current.show_leave_review_badge_reviews,
    }))
  }, [stats])

  async function toggle(field: keyof BadgeSettings, checked: boolean) {
    const previous = values
    const sent = { ...values, [field]: checked }
    setValues(sent)
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/admin/reviews-badges', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(homeFlagsReady ? sent : {
          badge_enabled: sent.badge_enabled, google_badge_enabled: sent.google_badge_enabled,
          show_leave_review_badge_home: sent.show_leave_review_badge_home,
          show_leave_review_badge_reviews: sent.show_leave_review_badge_reviews,
        }),
      })
      if (!response.ok) {
        setValues(previous)
        setError(await readError(response))
        return
      }
      baseline.current = sent
      setValues(sent)
      setSuccess('Saved.')
      router.refresh()
    } catch {
      setValues(previous)
      setError(NETWORK)
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="group rounded-lg border border-border bg-surface">
      <summary className="cursor-pointer list-none p-4 font-heading font-bold marker:hidden">
        <span className="mr-2 inline-block text-brand-red transition-transform group-open:rotate-90" aria-hidden="true">›</span>
        Badges
      </summary>
      <div className="space-y-6 border-t border-border p-4" aria-busy={busy}>
        {!stats && <p role="alert" className="text-sm text-red-400">Couldn&apos;t load badge settings. Refresh to try again.</p>}
        {stats && !homeFlagsReady && <p role="status" className="text-sm text-amber-300">Run the supplied home-page badge SQL in Supabase, then refresh to enable the home-page checkboxes. Reviews page controls still work.</p>}
        {([
          { field: 'badge_enabled', homeField: 'show_satisfaction_badge_home', src: '/satisfaction-badge.svg', alt: 'Customer satisfaction is always #1' },
          { field: 'google_badge_enabled', homeField: 'show_google_badge_home', src: null, alt: 'Google Reviews badge' },
        ] as const).map(({ field, homeField, src, alt }) => (
          <div key={field} className="space-y-3">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={alt} className="w-full max-w-sm h-auto" />
            ) : <GoogleReviewsBadge stats={googleProfile} className="w-full max-w-sm h-auto" />}
            <label className="flex w-fit gap-2 items-center text-sm">
              <input type="checkbox" className="accent-brand-red focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper" aria-label={`Show ${alt} on Reviews page`} checked={values[field]} disabled={busy || !stats} onChange={(e) => void toggle(field, e.target.checked)} />
              Show on Reviews page
            </label>
            <label className="flex w-fit gap-2 items-center text-sm">
              <input type="checkbox" className="accent-brand-red focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper" aria-label={`Show ${alt} on home page`} checked={values[homeField]} disabled={busy || !stats || !homeFlagsReady} onChange={(e) => void toggle(homeField, e.target.checked)} />
              Show on home page
            </label>
            {field === 'google_badge_enabled' && (
              <ProfilePanel stats={googleProfile} />
            )}
          </div>
        ))}
        <section className="space-y-3 border-t border-border pt-6" aria-labelledby="leave-review-badge-title">
          <h2 id="leave-review-badge-title" className="font-heading font-bold">Leave a Google Review</h2>
          <LeaveGoogleReviewBadge href={googleProfile?.write_review_url} />
          <p className="text-sm text-ink-muted">G-only on mobile; full button on desktop. Replaces the rating badge in the same position when both are enabled.</p>
          {typeof stats?.show_leave_review_badge_home !== 'boolean' && <p role="status" className="text-sm text-amber-300">Run the new review-button badge SQL in Supabase to enable these checkboxes.</p>}
          {([
            ['show_leave_review_badge_reviews', 'Show on Reviews page'],
            ['show_leave_review_badge_home', 'Show on home page'],
          ] as const).map(([field, label]) => (
            <label key={field} className="flex w-fit items-center gap-2 text-sm">
              <input type="checkbox" aria-label={`${label}: Leave a Google Review`} className="accent-brand-red" checked={values[field] === true} disabled={busy || typeof stats?.[field] !== 'boolean'} onChange={e => void toggle(field, e.target.checked)} />
              {label}
            </label>
          ))}
          <p className="text-sm text-ink-muted">To change its destination, edit the Leave-a-review link in Google badge and profile settings above. It defaults to your supplied Google review link.</p>
        </section>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {success && <p role="status" className="text-sm text-emerald-400">{success}</p>}
      </div>
    </details>
  )
}
