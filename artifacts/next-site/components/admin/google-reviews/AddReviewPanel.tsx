'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { GoogleReview } from '@/lib/google-reviews/types'
import { GENERIC, NETWORK, inputCls, labelCls, readError, todayISO } from './utils'

export default function AddReviewPanel({ onAdded }: { onAdded: (r: GoogleReview) => void }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState('5')
  const [comment, setComment] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const max = todayISO()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const reviewer_name = name.trim()
    const star_rating = Number(rating)
    const text = comment.trim()
    if (!reviewer_name || reviewer_name.length > 100) return setError('Reviewer name must be 1 to 100 characters.')
    if (!Number.isInteger(star_rating) || star_rating < 1 || star_rating > 5) return setError('Pick a star rating from 1 to 5.')
    if (text.length > 4000) return setError('Review text must be 4000 characters or fewer.')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > max || date < '2010-01-01')
      return setError('Pick a date between Jan 1, 2010 and today.')
    setBusy(true)
    try {
      const res = await fetch('/api/admin/google-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewer_name, star_rating, comment: text, review_created_at: date }),
      })
      if (!res.ok) {
        setError(await readError(res))
        return
      }
      const data = await res.json().catch(() => null)
      if (!data || typeof data.id !== 'string') {
        setError(GENERIC)
        return
      }
      onAdded({
        id: data.id,
        source: 'manual',
        status: 'published',
        reviewer_name,
        star_rating,
        comment: text || null,
        review_created_at: `${date}T12:00:00.000Z`,
        google_review_id: null,
        reviewer_photo_url: null,
      })
      setName('')
      setRating('5')
      setComment('')
      setDate('')
      setSuccess('Review added to Published.')
    } catch {
      setError(NETWORK)
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="group rounded-lg border border-border bg-surface">
      <summary className="cursor-pointer list-none p-4 font-heading font-bold marker:hidden">
        <span className="mr-2 inline-block text-brand-red transition-transform group-open:rotate-90" aria-hidden="true">
          ›
        </span>
        Add a review
      </summary>
      <form onSubmit={submit} className="space-y-4 border-t border-border p-4" noValidate>
        <p className="text-sm text-ink-muted">Copy the review exactly as it appears on Google. An approximate date is fine.</p>
        <div>
          <label htmlFor="gr-name" className={labelCls}>Reviewer name</label>
          <input id="gr-name" disabled={busy} className={inputCls} value={name} maxLength={100} required onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gr-rating" className={labelCls}>Star rating</label>
            <select id="gr-rating" disabled={busy} className={inputCls} value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} {'★'.repeat(n)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gr-date" className={labelCls}>Approximate date</label>
            <input id="gr-date" disabled={busy} type="date" className={`${inputCls} [color-scheme:dark]`} value={date} min="2010-01-01" max={max} required onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor="gr-text" className={labelCls}>Review text (optional)</label>
          <textarea id="gr-text" disabled={busy} rows={4} maxLength={4000} className={inputCls} value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" type="submit" disabled={busy} className="disabled:opacity-50">
            {busy ? 'Adding...' : 'Add review'}
          </Button>
          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}
          {success && <p className="text-sm text-emerald-400" role="status">{success}</p>}
        </div>
      </form>
    </details>
  )
}

