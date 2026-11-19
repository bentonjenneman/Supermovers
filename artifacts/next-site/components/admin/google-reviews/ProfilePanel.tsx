'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import type { GoogleProfileStats } from '@/lib/google-reviews/types'
import { NETWORK, formatDate, inputCls, labelCls, readError } from './utils'

type Field = 'reviewsUrl' | 'writeUrl' | 'avg' | 'count'
type Values = Record<Field, string>

function fromStats(stats: GoogleProfileStats | null): Values {
  return {
    reviewsUrl: stats?.reviews_url ?? '',
    writeUrl: stats?.write_review_url ?? '',
    avg: stats?.average_rating != null ? String(stats.average_rating) : '',
    count: stats?.total_review_count != null ? String(stats.total_review_count) : '',
  }
}

export default function ProfilePanel({ stats }: { stats: GoogleProfileStats | null }) {
  const router = useRouter()
  const isApi = stats?.stats_source === 'api'
  const [values, setValues] = useState<Values>(() => fromStats(stats))
  // last server-known values per field; a field is pristine when it equals its baseline
  const baseline = useRef<Values>(fromStats(stats))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const incoming = fromStats(stats)
    const prevBase = baseline.current
    baseline.current = incoming
    setValues((cur) => {
      const next = { ...cur }
      for (const k of Object.keys(incoming) as Field[]) {
        if (cur[k] === prevBase[k]) next[k] = incoming[k]
      }
      return next
    })
  }, [stats])

  function set(k: Field, v: string) {
    setSuccess('')
    setValues((cur) => ({ ...cur, [k]: v }))
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    let average_rating: number | null = null
    let total_review_count: number | null = null
    if (!isApi) {
      if (values.avg.trim() !== '') {
        const n = Number(values.avg)
        if (!Number.isFinite(n) || n < 1 || n > 5) return setError('Average rating must be a number from 1 to 5.')
        average_rating = Math.round(n * 10) / 10
      }
      if (values.count.trim() !== '') {
        const n = Number(values.count)
        if (!Number.isInteger(n) || n < 0) return setError('Review count must be a whole number of 0 or more.')
        total_review_count = n
      }
    } else {
      average_rating = stats?.average_rating ?? null
      total_review_count = stats?.total_review_count ?? null
    }
    const sent: Values = {
      reviewsUrl: values.reviewsUrl.trim(),
      writeUrl: values.writeUrl.trim(),
      avg: isApi ? values.avg : average_rating != null ? String(average_rating) : '',
      count: isApi ? values.count : total_review_count != null ? String(total_review_count) : '',
    }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/google-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reviews_url: sent.reviewsUrl || null,
          write_review_url: sent.writeUrl || null,
          average_rating,
          total_review_count,
        }),
      })
      if (!res.ok) {
        setError(await readError(res))
        return
      }
      // fields are disabled while busy, so the sent values are the current values
      baseline.current = sent
      setValues(sent)
      setSuccess('Saved.')
      router.refresh()
    } catch {
      setError(NETWORK)
    } finally {
      setBusy(false)
    }
  }

  if (!stats) {
    return <p role="alert" className="text-sm text-red-400">Couldn&apos;t load Google badge settings. Refresh to try again.</p>
  }

  return (
    <section className="rounded-lg border border-border bg-ink/30 p-4" aria-labelledby="google-badge-settings">
      <h2 id="google-badge-settings" className="font-heading font-bold">Google badge and profile settings</h2>
      <p className="mb-4 mt-1 text-sm text-ink-muted">The Google Business Profile link is used by the badge on both the home and Reviews pages.</p>
      <form onSubmit={save} className="space-y-4" noValidate aria-busy={busy}>
        <div className="space-y-3">
          <div>
            <label htmlFor="gp-reviews" className={labelCls}>Google Business Profile link</label>
            <input id="gp-reviews" type="url" inputMode="url" className={inputCls} value={values.reviewsUrl} disabled={busy} placeholder="https://g.page/..." onChange={(e) => set('reviewsUrl', e.target.value)} />
          </div>
          <div>
            <label htmlFor="gp-write" className={labelCls}>Leave-a-review link</label>
            <input id="gp-write" type="url" inputMode="url" className={inputCls} value={values.writeUrl} disabled={busy} placeholder="https://g.page/r/.../review" onChange={(e) => set('writeUrl', e.target.value)} />
          </div>
          <p className="text-sm text-ink-muted">Paste the links from your Google Business Profile. Google links only.</p>
        </div>
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gp-avg" className={labelCls}>Average rating</label>
              <input id="gp-avg" type="number" step="0.1" min="1" max="5" inputMode="decimal" className={inputCls} value={values.avg} disabled={isApi || busy} onChange={(e) => set('avg', e.target.value)} />
            </div>
            <div>
              <label htmlFor="gp-count" className={labelCls}>Review count</label>
              <input id="gp-count" type="number" step="1" min="0" inputMode="numeric" className={inputCls} value={values.count} disabled={isApi || busy} onChange={(e) => set('count', e.target.value)} />
            </div>
          </div>
          {isApi ? (
            <p className="text-sm text-ink-muted">These numbers come from Google automatically and can&apos;t be edited here.</p>
          ) : (
            <p className="text-sm text-ink-muted">Type in the numbers currently shown on Google. Update them when they change.</p>
          )}
          <p className="text-xs text-ink-muted">Enter a whole number, such as 300. The badge shows counts of 100 or more as the lower hundred plus (for example, 327 displays as 300+).</p>
          {stats?.stats_updated_at && (
            <p className="text-xs text-ink-muted">Last updated {formatDate(stats.stats_updated_at)}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" type="submit" disabled={busy} className="disabled:opacity-50">
            {busy ? 'Saving...' : 'Save'}
          </Button>
          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
          {success && <p className="text-sm text-emerald-400" role="status">{success}</p>}
        </div>
      </form>
    </section>
  )
}
