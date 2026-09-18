'use client'

import { useState } from 'react'
import type { Quote } from '@/app/admin/dashboard/quotes/page'

const STATUS_OPTIONS = ['new', 'contacted', 'quoted', 'closed'] as const
type Status = (typeof STATUS_OPTIONS)[number]

const STATUS_COLORS: Record<Status, string> = {
  new: 'bg-brand-blue text-white',
  contacted: 'bg-tint-red text-paper',
  quoted: 'bg-tint-blue text-white',
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
    <>
      <div className="space-y-4 md:hidden">
        {quotes.map((q) => (
          <article key={q.id} className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="font-heading font-bold text-paper text-lg break-words">{q.name}</h2>
                <p className="font-body text-xs text-ink-muted mt-1" suppressHydrationWarning>
                  {new Date(q.created_at).toLocaleString()}
                </p>
              </div>
              <div
                className={`${
                  STATUS_COLORS[q.status as Status] ?? STATUS_COLORS.new
                } rounded-full px-3 py-1 text-xs font-bold shrink-0`}
              >
                <select
                  value={q.status}
                  onChange={(e) => handleStatusChange(q.id, e.target.value as Status)}
                  aria-label={`Status for ${q.name}`}
                  className="bg-transparent border-none text-inherit font-inherit text-xs focus:outline-none cursor-pointer appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s} style={{ background: '#141414', color: '#F5F1ED' }}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <dl className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-x-4 gap-y-3">
              <MobileField label="Phone" value={q.phone} />
              <MobileField label="Move date" value={q.move_date ?? '—'} />
              <MobileField label="Email" value={q.email} breakAll />
              <MobileField label="Move size" value={q.move_size ?? '—'} />
              <MobileField label="From" value={q.origin_address ?? '—'} />
              <MobileField label="To" value={q.destination_address ?? '—'} />
            </dl>

            <div className="border-t border-border mt-4 pt-4">
              <h3 className="font-body font-semibold text-xs text-ink-muted uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="font-body text-sm leading-relaxed text-paper whitespace-pre-wrap break-words">
                {q.notes || '—'}
              </p>
            </div>

            {rowError?.id === q.id && (
              <p className="font-body text-xs text-brand-red mt-3">{rowError.message}</p>
            )}
          </article>
        ))}
      </div>

      <div className="hidden md:block bg-surface rounded-lg border border-border overflow-x-auto">
        <table className="w-full min-w-[1120px]">
        <thead>
          <tr className="bg-ink">
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
              className={`border-t border-border hover:bg-white/5 transition-colors ${
                i % 2 === 1 ? 'bg-ink/40' : 'bg-surface'
              }`}
            >
              <td
                className="px-4 py-3 font-body text-sm text-paper whitespace-nowrap"
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
              <td className="px-4 py-3 font-body text-sm text-paper">{q.name}</td>
              <td className="px-4 py-3 font-body text-sm text-paper">{q.email}</td>
              <td className="px-4 py-3 font-body text-sm text-paper whitespace-nowrap">{q.phone}</td>
              <td className="px-4 py-3 font-body text-sm text-paper whitespace-nowrap">{q.move_date ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-paper">{q.origin_address ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-paper">{q.destination_address ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm text-paper">{q.move_size ?? '—'}</td>
              <td className="px-4 py-3 font-body text-sm leading-relaxed text-paper min-w-[260px] max-w-[360px] whitespace-pre-wrap break-words align-top">
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
                    style={{ colorScheme: 'dark' }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} style={{ background: '#141414', color: '#F5F1ED' }}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {rowError?.id === q.id && (
                  <div className="font-body text-xs text-brand-red mt-1">
                    {rowError.message}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </>
  )
}

function MobileField({
  label,
  value,
  breakAll = false,
}: {
  label: string
  value: string
  breakAll?: boolean
}) {
  return (
    <div className="min-w-0">
      <dt className="font-body font-semibold text-[11px] text-ink-muted uppercase tracking-wide">
        {label}
      </dt>
      <dd className={`font-body text-sm text-paper mt-0.5 ${breakAll ? 'break-all' : 'break-words'}`}>
        {value}
      </dd>
    </div>
  )
}
