'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function Admin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin/dashboard/quotes')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(
          res.status === 401
            ? 'Incorrect password.'
            : (data?.error ?? 'Something went wrong. Please try again.'),
        )
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-border rounded-lg max-w-sm w-full p-8 flex flex-col gap-4"
      >
        <h1 className="font-heading font-extrabold text-paper text-2xl">Admin Login</h1>

        <div className="flex flex-col gap-1">
          <label className="font-body text-sm font-semibold text-paper" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-ink border border-border rounded-md px-3 py-2 font-body text-sm text-paper placeholder-ink-muted focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red disabled:opacity-50"
          />
        </div>

        {error && (
          <p className="font-body text-sm text-brand-red">{error}</p>
        )}

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </main>
  )
}
