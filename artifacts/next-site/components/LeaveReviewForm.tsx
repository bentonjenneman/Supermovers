'use client'

import { useState, FormEvent } from 'react'

interface FormData {
  name: string
  rating: string
  review_text: string
  company_website: string // honeypot
}

const empty: FormData = {
  name: '',
  rating: '',
  review_text: '',
  company_website: '',
}

export default function LeaveReviewForm() {
  const [fields, setFields] = useState<FormData>(empty)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  function set(key: keyof FormData) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => setFields((prev) => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValidationError(null)
    setError(null)

    if (!fields.name.trim()) {
      setValidationError('Name is required.')
      return
    }
    if (!fields.review_text.trim()) {
      setValidationError('Review text is required.')
      return
    }
    const rating = Number(fields.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setValidationError('Please select a rating between 1 and 5.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          rating,
          review_text: fields.review_text.trim(),
          company_website: fields.company_website,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(
          (data as { error?: string }).error ??
            'Something went wrong. Please try again.',
        )
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <p>Thanks for your feedback — we review submissions before they&apos;re published.</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Leave a review</h2>

      {/* Honeypot — visually hidden, excluded from tab order */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <label htmlFor="review_company_website">Website</label>
        <input
          id="review_company_website"
          type="text"
          name="company_website"
          value={fields.company_website}
          onChange={set('company_website')}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="review_name">Name *</label>
        <input
          id="review_name"
          type="text"
          value={fields.name}
          onChange={set('name')}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="review_rating">Rating *</label>
        <select
          id="review_rating"
          value={fields.rating}
          onChange={set('rating')}
          required
          disabled={loading}
        >
          <option value="">Select…</option>
          <option value="5">5 — Excellent</option>
          <option value="4">4 — Good</option>
          <option value="3">3 — Average</option>
          <option value="2">2 — Poor</option>
          <option value="1">1 — Terrible</option>
        </select>
      </div>

      <div>
        <label htmlFor="review_text">Your review *</label>
        <textarea
          id="review_text"
          value={fields.review_text}
          onChange={set('review_text')}
          rows={5}
          required
          disabled={loading}
        />
      </div>

      {validationError && <p style={{ color: 'red' }}>{validationError}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
