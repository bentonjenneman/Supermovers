'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

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
        router.push('/admin/dashboard')
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
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '280px' }}
      >
        <h1 style={{ margin: 0 }}>Admin Login</h1>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
          style={{ padding: '8px', fontSize: '1rem' }}
        />

        {error && (
          <p style={{ color: 'red', margin: 0, fontSize: '0.9rem' }}>{error}</p>
        )}

        <button type="submit" disabled={loading} style={{ padding: '8px', fontSize: '1rem' }}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </main>
  )
}
