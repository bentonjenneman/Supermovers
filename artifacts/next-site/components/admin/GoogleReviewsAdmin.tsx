'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import type {
  GoogleProfileStats,
  GoogleReview,
  GoogleReviewStatus,
} from '@/lib/google-reviews/types'
import AddReviewPanel from './google-reviews/AddReviewPanel'
import { GENERIC, NETWORK, formatDate, readError, smallBtn } from './google-reviews/utils'

function sortReviews(list: GoogleReview[]): GoogleReview[] {
  return [...list].sort(
    (a, b) =>
      new Date(b.review_created_at).getTime() -
      new Date(a.review_created_at).getTime(),
  )
}


function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <span className="text-brand-red tracking-wider" aria-label={`${r} out of 5 stars`}>
      <span aria-hidden="true">{'★'.repeat(r) + '☆'.repeat(5 - r)}</span>
    </span>
  )
}

interface Props {
  reviews: GoogleReview[]
  stats: Pick<GoogleProfileStats, 'last_synced_at' | 'last_sync_error'> | null
}

export default function GoogleReviewsAdmin({ reviews, stats }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<GoogleReview[]>(() => sortReviews(reviews))
  const [pending, setPending] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  // optimistic overrides that should survive prop refreshes until settled
  const overrides = useRef<Record<string, GoogleReviewStatus | 'deleted'>>({})
  const added = useRef<Record<string, GoogleReview>>({})

  useEffect(() => {
    const ids = new Set(reviews.map((r) => r.id))
    let next = reviews
      .filter((r) => overrides.current[r.id] !== 'deleted')
      .map((r) => {
        const o = overrides.current[r.id]
        return o && o !== 'deleted' ? { ...r, status: o } : r
      })
    for (const [id, o] of Object.entries(overrides.current)) {
      // server confirmed removal: drop the tombstone
      if (o === 'deleted' && !ids.has(id)) delete overrides.current[id]
    }
    for (const [id, r] of Object.entries(added.current)) {
      if (ids.has(id)) delete added.current[id]
      else if (overrides.current[id] !== 'deleted') next = [...next, r]
    }
    setItems(sortReviews(next))
  }, [reviews])

  async function changeStatus(review: GoogleReview, status: GoogleReviewStatus) {
    const id = review.id
    const prev = review.status
    overrides.current[id] = status
    setPending((p) => ({ ...p, [id]: true }))
    setErrors((e) => ({ ...e, [id]: '' }))
    setItems((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))
    let ok = false
    let msg = GENERIC
    try {
      const res = await fetch(`/api/admin/google-reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      })
      ok = res.ok
      if (!ok) msg = await readError(res)
    } catch {
      msg = NETWORK
    }
    if (!ok) {
      setItems((list) => list.map((r) => (r.id === id ? { ...r, status: prev } : r)))
      setErrors((e) => ({ ...e, [id]: msg }))
    } else if (added.current[id]) {
      added.current[id] = { ...added.current[id], status }
    }
    delete overrides.current[id]
    setPending((p) => ({ ...p, [id]: false }))
    if (ok) router.refresh()
  }

  async function remove(review: GoogleReview) {
    if (!window.confirm(`Delete the review from ${review.reviewer_name}? This cannot be undone.`)) return
    const id = review.id
    setPending((p) => ({ ...p, [id]: true }))
    setErrors((e) => ({ ...e, [id]: '' }))
    let ok = false
    let msg = GENERIC
    try {
      const res = await fetch(`/api/admin/google-reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      ok = res.ok
      if (!ok) msg = await readError(res)
    } catch {
      msg = NETWORK
    }
    setPending((p) => ({ ...p, [id]: false }))
    if (ok) {
      overrides.current[id] = 'deleted'
      delete added.current[id]
      setItems((list) => list.filter((r) => r.id !== id))
      router.refresh()
    } else {
      setErrors((e) => ({ ...e, [id]: msg }))
    }
  }

  function onAdded(r: GoogleReview) {
    added.current[r.id] = r
    setItems((list) => sortReviews([...list.filter((x) => x.id !== r.id), r]))
    router.refresh()
  }

  const groups: { key: GoogleReviewStatus; title: string; empty: string }[] = [
    { key: 'pending', title: 'Pending', empty: 'No pending reviews.' },
    { key: 'published', title: 'Published', empty: 'No published reviews.' },
    { key: 'hidden', title: 'Hidden', empty: 'No hidden reviews.' },
  ]

  return (
    <div className="space-y-8 text-paper">
      <p className="text-sm text-ink-muted" data-testid="text-last-synced">
        Last synced: {stats?.last_synced_at ? formatDate(stats.last_synced_at) : 'never'}
        {stats?.last_sync_error && (
          <span className="mt-1 block text-red-400" role="alert">
            {stats.last_sync_error}
          </span>
        )}
      </p>

      <AddReviewPanel onAdded={onAdded} />

      {groups.map((g) => {
        const list = items.filter((r) => r.status === g.key)
        return (
          <section key={g.key} aria-labelledby={`h-${g.key}`}>
            <h2 id={`h-${g.key}`} className="mb-3 font-heading text-lg font-bold">
              {g.title} ({list.length})
            </h2>
            {list.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center text-sm text-ink-muted">
                {g.empty}
              </p>
            ) : (
              <ul className="space-y-3">
                {list.map((r) => (
                  <ReviewCard
                    key={r.id}
                    review={r}
                    busy={!!pending[r.id]}
                    error={errors[r.id]}
                    onStatus={(s) => changeStatus(r, s)}
                    onDelete={() => remove(r)}
                  />
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

function ReviewCard({
  review,
  busy,
  error,
  onStatus,
  onDelete,
}: {
  review: GoogleReview
  busy: boolean
  error?: string
  onStatus: (s: GoogleReviewStatus) => void
  onDelete: () => void
}) {
  const manual = review.source === 'manual'
  const actions: { label: string; status: GoogleReviewStatus; primary?: boolean }[] =
    review.status === 'pending'
      ? [{ label: 'Publish', status: 'published', primary: true }, { label: 'Hide', status: 'hidden' }]
      : review.status === 'published'
        ? [{ label: 'Move to pending', status: 'pending' }, { label: 'Hide', status: 'hidden' }]
        : [{ label: 'Publish', status: 'published', primary: true }, { label: 'Move to pending', status: 'pending' }]

  return (
    <li
      className={`rounded-lg border border-border bg-surface p-4 transition-opacity ${busy ? 'opacity-60' : ''}`}
      aria-busy={busy}
      data-testid={`card-review-${review.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-heading font-bold">{review.reviewer_name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-sm">
            <Stars rating={review.star_rating} />
            <time className="text-ink-muted" dateTime={review.review_created_at}>
              {formatDate(review.review_created_at)}
            </time>
          </div>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wider text-ink-muted">
          {manual ? 'Added manually' : 'Synced from Google'}
        </span>
      </div>
      {review.comment && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-paper/90">{review.comment}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant={a.primary ? 'primary' : 'secondary'}
            className={smallBtn}
            disabled={busy}
            onClick={() => onStatus(a.status)}
          >
            {a.label}
          </Button>
        ))}
        {manual && (
          <Button
            variant="secondary"
            className={`${smallBtn} border-brand-red text-red-300 hover:bg-brand-red hover:text-paper`}
            disabled={busy}
            onClick={onDelete}
          >
            Delete
          </Button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </li>
  )
}
