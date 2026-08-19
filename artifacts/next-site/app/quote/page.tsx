'use client'

import { useState, FormEvent } from 'react'
import Button from '@/components/ui/Button'

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

const labelCls = 'font-body font-semibold text-sm text-ink mb-1 block'
const inputCls =
  'font-body text-sm border border-border rounded-md px-3 py-2 w-full focus:outline-none focus:border-brand-orange'

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
        <section className="bg-brand-blue py-14 text-center px-4">
          <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl">
            Get your Super quote
          </h1>
          <p className="font-body text-white/80 text-base mt-3">
            Free, no obligation. Tell us about your move and we&apos;ll get back to you.
          </p>
        </section>
        <section className="bg-paper py-16">
          <div className="max-w-xl mx-auto px-4">
            <p className="font-body text-ink text-center text-lg py-8">
              Thanks — we&apos;ll be in touch soon.
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-14 text-center px-4">
        <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl">
          Get your Super quote
        </h1>
        <p className="font-body text-white/80 text-base mt-3">
          Free, no obligation. Tell us about your move and we&apos;ll get back to you.
        </p>
      </section>

      {/* ── FORM SECTION ─────────────────────────────────────────────────── */}
      <section className="bg-paper py-16">
        <div className="max-w-xl mx-auto px-4">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-lg border border-border p-6 md:p-8"
          >
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

            <div className="mb-4">
              <label htmlFor="name" className={labelCls}>Name *</label>
              <input
                id="name"
                type="text"
                value={fields.name}
                onChange={set('name')}
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className={labelCls}>Email *</label>
              <input
                id="email"
                type="email"
                value={fields.email}
                onChange={set('email')}
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className={labelCls}>Phone *</label>
              <input
                id="phone"
                type="tel"
                value={fields.phone}
                onChange={set('phone')}
                required
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="move_date" className={labelCls}>Move date</label>
              <input
                id="move_date"
                type="date"
                value={fields.move_date}
                onChange={set('move_date')}
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="origin_address" className={labelCls}>Moving from</label>
              <input
                id="origin_address"
                type="text"
                value={fields.origin_address}
                onChange={set('origin_address')}
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="destination_address" className={labelCls}>Moving to</label>
              <input
                id="destination_address"
                type="text"
                value={fields.destination_address}
                onChange={set('destination_address')}
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="move_size" className={labelCls}>Move size</label>
              <input
                id="move_size"
                type="text"
                placeholder="e.g. studio, 3-bedroom house"
                value={fields.move_size}
                onChange={set('move_size')}
                disabled={loading}
                className={inputCls}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className={labelCls}>Notes</label>
              <textarea
                id="notes"
                placeholder="Anything abnormally large, heavy, or fragile that we should know about"
                value={fields.notes}
                onChange={set('notes')}
                rows={4}
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
              {loading ? 'Sending…' : 'Get a quote'}
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
