'use client'

import { useState } from 'react'
import type { Review } from '@/app/admin/dashboard/reviews/page'

interface RowError {
  id: string
  message: string
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
      // Was a publish attempt — move back to pending
      setPublished((prev) => prev.filter((r) => r.id !== review.id))
      setPending((prev) => [review, ...prev])
    } else {
      // Was an unpublish attempt — move back to published
      setPending((prev) => prev.filter((r) => r.id !== review.id))
      setPublished((prev) => [review, ...prev])
    }
  }

  return (
    <>
      <section>
        <h2>Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p>No pending reviews.</p>
        ) : (
          <ul>
            {pending.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> — {r.rating}/5
                <p>{r.review_text}</p>
                <small suppressHydrationWarning>{new Date(r.created_at).toLocaleString()}</small>
                <div>
                  <button onClick={() => toggle(r, true)}>Publish</button>
                  {rowError?.id === r.id && (
                    <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '8px' }}>
                      {rowError.message}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Published ({published.length})</h2>
        {published.length === 0 ? (
          <p>No published reviews yet.</p>
        ) : (
          <ul>
            {published.map((r) => (
              <li key={r.id}>
                <strong>{r.name}</strong> — {r.rating}/5
                <p>{r.review_text}</p>
                <small suppressHydrationWarning>{new Date(r.created_at).toLocaleString()}</small>
                <div>
                  <button onClick={() => toggle(r, false)}>Unpublish</button>
                  {rowError?.id === r.id && (
                    <span style={{ color: 'red', fontSize: '0.8rem', marginLeft: '8px' }}>
                      {rowError.message}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
