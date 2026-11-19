'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BlogComment } from '@/lib/blog'
import { adminCall, btn } from './api'

type Row = BlogComment & { blog_posts: { title: string; slug: string } | null }
type Status = 'pending' | 'approved' | 'rejected' | 'all'

export default function CommentModeration() {
  const [status, setStatus] = useState<Status>('pending')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<Row[] | null>(null)
  const [total, setTotal] = useState(0)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const [actErr, setActErr] = useState('')

  const load = useCallback(async () => {
    setErr(''); setRows(null)
    try { const r = await adminCall<{ comments: Row[]; total: number }>(`/api/admin/blog/comments?status=${status}&page=${page}`); setRows(r.comments); setTotal(r.total) }
    catch (e) { setErr((e as Error).message) }
  }, [status, page])
  useEffect(() => { load() }, [load])

  async function act(id: string, kind: 'approved' | 'rejected' | 'pending' | 'delete') {
    setBusyId(id); setActErr('')
    try {
      if (kind === 'delete') await adminCall(`/api/admin/blog/comments/${id}`, { method: 'DELETE' })
      else await adminCall(`/api/admin/blog/comments/${id}`, { method: 'PATCH', body: JSON.stringify({ status: kind }) })
      setConfirmId(''); await load()
    } catch (e) { setActErr((e as Error).message) }
    finally { setBusyId('') }
  }

  const pages = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(s => (
          <button key={s} type="button" onClick={() => { setStatus(s); setPage(1) }} data-testid={`filter-${s}`}
            className={`rounded-full border px-3.5 py-1 font-body text-sm font-semibold capitalize transition-colors ${status === s ? 'border-brand-red bg-brand-red text-white' : 'border-border text-ink-muted hover:text-paper'}`}>{s}</button>
        ))}
      </div>
      {actErr && <p role="alert" className="rounded-lg border border-brand-red/50 bg-brand-red/10 p-3 font-body text-sm text-paper">{actErr}</p>}
      {err ? (
        <div role="alert" className="rounded-xl border border-brand-red/50 bg-surface p-5 font-body text-sm text-paper">{err}
          <button type="button" onClick={load} className="ml-3 font-bold text-brand-red underline">Retry</button></div>
      ) : !rows ? (
        [0, 1].map(i => <div key={i} className="h-28 animate-pulse rounded-xl bg-surface" />)
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center font-body text-ink-muted">No {status === 'all' ? '' : status} comments.</div>
      ) : rows.map(c => (
        <div key={c.id} className="rounded-xl border border-border bg-surface p-5" data-testid={`row-comment-${c.id}`}>
          <div className="flex flex-wrap items-center gap-2 font-body text-xs text-ink-muted">
            <span className="font-heading text-sm font-bold text-paper">{c.name}</span>
            <span>{new Date(c.created_at).toLocaleString()}</span>
            <span className={`rounded-full px-2 py-0.5 font-bold uppercase ${c.status === 'approved' ? 'bg-brand-blue text-white' : c.status === 'rejected' ? 'bg-brand-red/20 text-brand-red' : 'bg-ink text-paper'}`}>{c.status}</span>
            {c.blog_posts && <a href={`/blog/${c.blog_posts.slug}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-paper">on {c.blog_posts.title}</a>}
          </div>
          <p className="mt-3 whitespace-pre-line font-body text-sm text-paper/90">{c.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {c.status !== 'approved' && <button type="button" disabled={busyId === c.id} onClick={() => act(c.id, 'approved')} className={`${btn} bg-brand-blue text-white hover:opacity-90`} data-testid={`button-approve-${c.id}`}>Approve</button>}
            {c.status !== 'rejected' && <button type="button" disabled={busyId === c.id} onClick={() => act(c.id, 'rejected')} className={`${btn} border border-border text-paper hover:border-paper`} data-testid={`button-reject-${c.id}`}>{c.status === 'approved' ? 'Unpublish (reject)' : 'Reject'}</button>}
            {c.status !== 'pending' && <button type="button" disabled={busyId === c.id} onClick={() => act(c.id, 'pending')} className={`${btn} text-ink-muted hover:text-paper`}>Move to pending</button>}
            {confirmId === c.id ? (
              <span className="ml-auto flex items-center gap-2">
                <span className="font-body text-xs text-paper">Delete this comment permanently?</span>
                <button type="button" disabled={busyId === c.id} onClick={() => act(c.id, 'delete')} className={`${btn} bg-brand-red text-white`} data-testid={`button-confirm-delete-${c.id}`}>Delete</button>
                <button type="button" onClick={() => setConfirmId('')} className={`${btn} text-ink-muted`}>Cancel</button>
              </span>
            ) : <button type="button" onClick={() => setConfirmId(c.id)} className={`${btn} ml-auto text-brand-red hover:bg-brand-red/10`} data-testid={`button-delete-${c.id}`}>Delete</button>}
          </div>
        </div>
      ))}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 font-body text-sm">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btn} border border-border text-paper`}>Previous</button>
          <span className="text-ink-muted">{page} / {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={`${btn} border border-border text-paper`}>Next</button>
        </div>
      )}
    </div>
  )
}
