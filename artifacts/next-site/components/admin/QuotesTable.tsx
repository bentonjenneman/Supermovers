'use client'

import { useState } from 'react'
import type { Quote } from '@/app/admin/dashboard/quotes/page'

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'closed'] as const
type Status = (typeof STATUS_OPTIONS)[number]

interface RowError {
  id: string
  message: string
}

export default function QuotesTable({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [rowError, setRowError] = useState<RowError | null>(null)

  if (quotes.length === 0) {
    return <p>No quotes yet.</p>
  }

  async function handleStatusChange(id: string, newStatus: Status) {
    const previous = quotes.find((q) => q.id === id)?.status ?? 'new'

    // Optimistic update
    setQuotes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q)),
    )
    setRowError(null)

    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        // Revert
        setQuotes((prev) =>
          prev.map((q) => (q.id === id ? { ...q, status: previous } : q)),
        )
        const data = await res.json().catch(() => ({}))
        setRowError({
          id,
          message: (data as { error?: string }).error ?? 'Failed to update status.',
        })
      }
    } catch {
      // Revert on network error
      setQuotes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, status: previous } : q)),
      )
      setRowError({ id, message: 'Network error. Status not saved.' })
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Submitted</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Move date</th>
            <th>From</th>
            <th>To</th>
            <th>Size</th>
            <th>Notes</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q.id}>
              <td>{new Date(q.created_at).toLocaleString()}</td>
              <td>{q.name}</td>
              <td>{q.email}</td>
              <td>{q.phone}</td>
              <td>{q.move_date ?? '—'}</td>
              <td>{q.origin_address ?? '—'}</td>
              <td>{q.destination_address ?? '—'}</td>
              <td>{q.move_size ?? '—'}</td>
              <td>{q.notes ?? '—'}</td>
              <td>
                <select
                  value={q.status}
                  onChange={(e) =>
                    handleStatusChange(q.id, e.target.value as Status)
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {rowError?.id === q.id && (
                  <div style={{ color: 'red', fontSize: '0.8rem' }}>
                    {rowError.message}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
