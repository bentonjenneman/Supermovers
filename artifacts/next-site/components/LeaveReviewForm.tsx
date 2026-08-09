'use client'

import { useState, FormEvent } from 'react'
import Button from '@/components/ui/Button'

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

const labelCls = 'font-body font-semibold text-sm text-ink mb-1 block'
const inputCls =
  'font-body text-sm border border-border rounded-md px-3 py-2 w-full focus:outline-none focus:border-brand-orange'

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
      <p className="font-body text-ink text-center text-lg py-8">
        Thanks for your feedback — we review submissions before they&apos;re published.
      </p>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-lg border border-border p-6 md:p-8 mt-8"
    >
      <h2 className="font-heading font-bold text-ink text-xl mb-6">Leave a review</h2>

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

      <div className="mb-4">
        <label htmlFor="review_name" className={labelCls}>Name *</label>
        <input
          id="review_name"
          type="text"
          value={fields.name}
          onChange={set('name')}
          required
          disabled={loading}
          className={inputCls}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="review_rating" className={labelCls}>Rating *</label>
        <select
          id="review_rating"
          value={fields.rating}
          onChange={set('rating')}
          required
          disabled={loading}
          className={inputCls}
        >
          <option value="">Select…</option>
          <option value="5">5 — Excellent</option>
          <option value="4">4 — Good</option>
          <option value="3">3 — Average</option>
          <option value="2">2 — Poor</option>
          <option value="1">1 — Terrible</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="review_text" className={labelCls}>Your review *</label>
        <textarea
          id="review_text"
          value={fields.review_text}
          onChange={set('review_text')}
          rows={5}
          required
          disabled={loading}
          className={inputCls}
        />
      </div>

      {validationError && (
        <p className="font-body text-sm text-red-600 mb-4">{validationError}</p>
      )}
      {error && (
        <p className="font-body text-sm text-red-600 mb-4">{error}</p>
      )}

      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Submitting…' : 'Submit review'}
      </Button>
    </form>
  )
}
