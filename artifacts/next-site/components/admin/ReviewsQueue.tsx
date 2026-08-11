'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { Review } from '@/app/admin/dashboard/reviews/page'

interface RowError {
  id: string
  message: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-brand-orange text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ReviewsQueue({
  pendingReviews,
  publishedReviews,
}: {
  pendingReviews: Review[]
  publishedReviews: Review[]
}) {
  const [pending, setPending] = useState<Review[]>(pendingReviews)
  const [published, setPublished] = useState<Review[]>(publishedReviews)
  const [rowError, setRowError] = useState<RowError | null>(null)

  async function toggle(review: Review, newPublished: boolean) {
    setRowError(null)

    // Optimistic move
    if (newPublished) {
      setPending((prev) => prev.filter((r) => r.id !== review.id))
      setPublished((prev) => [{ ...review, published: true }, ...prev])
    } else {
      setPublished((prev) => prev.filter((r) => r.id !== review.id))
      setPending((prev) => [{ ...review, published: false }, ...prev])
    }

    try {
      const res = await fetch(`/api/admin/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: newPublished }),
      })

      if (!res.ok) {
        revert(review, newPublished)
        const data = await res.json().catch(() => ({}))
        setRowError({
          id: review.id,
          message: (data as { error?: string }).error ?? 'Failed to update review.',
        })
      }
    } catch {
      revert(review, newPublished)
      setRowError({ id: review.id, message: 'Network error. Change not saved.' })
    }
  }

  function revert(review: Review, failedPublished: boolean) {
    if (failedPublished) {
      setPublished((prev) => prev.filter((r) => r.id !== review.id))
      setPending((prev) => [review, ...prev])
    } else {
      setPending((prev) => prev.filter((r) => r.id !== review.id))
      setPublished((prev) => [review, ...prev])
    }
  }

  return (
    <>
      {/* Pending */}
      <section>
        <h2 className="font-heading font-bold text-ink text-lg mb-4">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="font-body text-ink-muted text-sm py-6">No pending reviews.</p>
        ) : (
          <div>
            {pending.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-border rounded-lg p-4 mb-3 flex flex-col gap-2"
              >
                <p className="font-heading font-bold text-ink text-sm">{r.name}</p>
                <Stars rating={r.rating} />
                <p className="font-body text-ink-muted text-sm">{r.review_text}</p>
                <p className="font-body text-xs text-ink-muted/60" suppressHydrationWarning>
                  {new Date(r.created_at).toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <Button
                    variant="primary"
                    onClick={() => toggle(r, true)}
                    className="text-xs px-4 py-2"
                  >
                    Publish
                  </Button>
                  {rowError?.id === r.id && (
                    <span className="font-body text-xs text-red-600">{rowError.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Published */}
      <section className="mt-10">
        <h2 className="font-heading font-bold text-ink text-lg mb-4">
          Published ({published.length})
        </h2>
        {published.length === 0 ? (
          <p className="font-body text-ink-muted text-sm py-6">No published reviews yet.</p>
        ) : (
          <div>
            {published.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-border rounded-lg p-4 mb-3 flex flex-col gap-2"
              >
                <p className="font-heading font-bold text-ink text-sm">{r.name}</p>
                <Stars rating={r.rating} />
                <p className="font-body text-ink-muted text-sm">{r.review_text}</p>
                <p className="font-body text-xs text-ink-muted/60" suppressHydrationWarning>
                  {new Date(r.created_at).toLocaleString()}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <Button
                    variant="secondary"
                    onClick={() => toggle(r, false)}
                    className="text-xs px-4 py-2"
                  >
                    Unpublish
                  </Button>
                  {rowError?.id === r.id && (
                    <span className="font-body text-xs text-red-600">{rowError.message}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
