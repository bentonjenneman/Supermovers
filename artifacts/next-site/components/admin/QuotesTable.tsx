'use client'

import { useState } from 'react'
import type { Quote } from '@/app/admin/dashboard/quotes/page'

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'closed'] as const
type Status = (typeof STATUS_OPTIONS)[number]

const STATUS_COLORS: Record<Status, string> = {
  new: 'bg-tint-blue text-brand-blue',
  contacted: 'bg-tint-orange text-brand-orange',
  quoted: 'bg-brand-blue/10 text-brand-blue',
  closed: 'bg-border text-ink-muted',
}

interface RowError {
  id: string
  message: string
}

export default function QuotesTable({ initialQuotes }: { initialQuotes: Quote[] }) {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [rowError, setRowError] = useState<RowError | null>(null)

  if (quotes.length === 0) {
    return (
      <p className="font-body text-ink-muted text-center py-12">No quotes yet.</p>
    )
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
    <div className="bg-white rounded-lg border border-border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-paper">
            {[
              'Submitted', 'Name', 'Email', 'Phone',
              'Move date', 'From', 'To', 'Size', 'Notes', 'Status',
            ].map((h) => (
              <th
                key={h}
                className="font-body font-semibold text-xs text-ink-muted uppercase tracking-wide text-left px-4 py-3 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quotes.map((q, i) => (
            <tr
              key={q.id}
              className={`border-t border-border hover:bg-tint-blue/30 transition-colors ${
                i % 2 === 1 ? 'bg-paper/40' : 'bg-white'
              }`}
            >
              <td
                className="px-4 py-3 font-body text-sm text-ink whitespace-nowrap"
                suppressHydrationWarning
              >
                {new Date(q.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3 font-body text-sm text-ink">{q.name}</td>
              <td className="px-4 py-3 font-body text-sm text-ink">{q.email}</td>
              <td className="px-4 py-3 font-body text-sm text-ink whitespace-nowrap">{q.phone}</td>
              <td className="px-4 py-3 font-body text-sm text-ink whitespace-nowrap">{q.move_date ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-ink">{q.origin_address ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-ink">{q.destination_address ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-ink">{q.move_size ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-ink max-w-[180px] truncate">
                {q.notes ?? '—'}
              </td>
              <td className="px-4 py-3">
                <div
                  className={`${
                    STATUS_COLORS[q.status as Status] ?? STATUS_COLORS.new
                  } rounded-full px-3 py-1 text-xs font-bold inline-flex items-center`}
                >
                  <select
                    value={q.status}
                    onChange={(e) => handleStatusChange(q.id, e.target.value as Status)}
                    className="bg-transparent border-none text-inherit font-inherit text-xs focus:outline-none cursor-pointer appearance-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {rowError?.id === q.id && (
                  <div className="font-body text-xs text-red-600 mt-1">
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
