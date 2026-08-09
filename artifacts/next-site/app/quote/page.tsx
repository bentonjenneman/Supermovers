'use client'

import { useState, FormEvent } from 'react'

interface FormData {
  name: string
  email: string
  phone: string
  move_date: string
  origin_address: string
  destination_address: string
  move_size: string
  notes: string
  company_website: string // honeypot
}

const empty: FormData = {
  name: '',
  email: '',
  phone: '',
  move_date: '',
  origin_address: '',
  destination_address: '',
  move_size: '',
  notes: '',
  company_website: '',
}

function isValidEmail(email: string) {
  const at = email.indexOf('@')
  if (at < 1) return false
  const dot = email.indexOf('.', at)
  return dot > at + 1
}

export default function GetAQuote() {
  const [fields, setFields] = useState<FormData>(empty)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  function set(key: keyof FormData) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setFields((prev) => ({ ...prev, [key]: e.target.value }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setValidationError(null)
    setError(null)

    // Client-side validation
    if (!fields.name.trim()) {
      setValidationError('Name is required.')
      return
    }
    if (!fields.email.trim() || !isValidEmail(fields.email.trim())) {
      setValidationError('A valid email address is required.')
      return
    }
    if (!fields.phone.trim()) {
      setValidationError('Phone number is required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.name.trim(),
          email: fields.email.trim(),
          phone: fields.phone.trim(),
          move_date: fields.move_date || null,
          origin_address: fields.origin_address.trim() || null,
          destination_address: fields.destination_address.trim() || null,
          move_size: fields.move_size.trim() || null,
          notes: fields.notes.trim() || null,
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
      <main>
        <p>Thanks — we&apos;ll be in touch soon.</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Get your Super quote. Free, no obligation, etc.</h1>

      <form onSubmit={handleSubmit} noValidate>
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
          <label htmlFor="company_website">Website</label>
          <input
            id="company_website"
            type="text"
            name="company_website"
            value={fields.company_website}
            onChange={set('company_website')}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="name">Name *</label>
          <input
            id="name"
            type="text"
            value={fields.name}
            onChange={set('name')}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            value={fields.email}
            onChange={set('email')}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="phone">Phone *</label>
          <input
            id="phone"
            type="tel"
            value={fields.phone}
            onChange={set('phone')}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="move_date">Move date</label>
          <input
            id="move_date"
            type="date"
            value={fields.move_date}
            onChange={set('move_date')}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="origin_address">Moving from</label>
          <input
            id="origin_address"
            type="text"
            value={fields.origin_address}
            onChange={set('origin_address')}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="destination_address">Moving to</label>
          <input
            id="destination_address"
            type="text"
            value={fields.destination_address}
            onChange={set('destination_address')}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="move_size">Move size</label>
          <input
            id="move_size"
            type="text"
            placeholder="e.g. studio, 3-bedroom house"
            value={fields.move_size}
            onChange={set('move_size')}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={fields.notes}
            onChange={set('notes')}
            rows={4}
            disabled={loading}
          />
        </div>

        {validationError && <p style={{ color: 'red' }}>{validationError}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Get a quote'}
        </button>
      </form>
    </main>
  )
}
