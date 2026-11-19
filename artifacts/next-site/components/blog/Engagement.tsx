'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BlogComment } from '@/lib/blog'
import { fmtDate, paragraphs } from './format'

type Eng = { liked: boolean; like_count: number; comment_count: number; comments: BlogComment[]; total: number }

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error || 'Something went wrong. Please try again.')
  return body as T
}

export default function Engagement({ postId }: { postId: string }) {
  const [data, setData] = useState<Eng | null>(null)
  const [loadErr, setLoadErr] = useState('')
  const [page, setPage] = useState(1)
  const [liking, setLiking] = useState(false)
  const [likeErr, setLikeErr] = useState('')
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [website, setWebsite] = useState('')
  const [sending, setSending] = useState(false)
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const load = useCallback(async (p: number) => {
    setLoadErr('')
    try { setData(await call<Eng>(`/api/blog/${postId}/engagement?page=${p}`)) }
    catch (e) { setLoadErr((e as Error).message) }
  }, [postId])

  useEffect(() => { setData(null); setPage(1); load(1) }, [load])

  async function toggleLike() {
    if (!data || liking) return
    setLiking(true); setLikeErr('')
    try {
      const r = await call<{ liked: boolean; like_count: number }>(`/api/blog/${postId}/like`, { method: 'PUT', body: JSON.stringify({ liked: !data.liked }) })
      setData(d => d ? { ...d, liked: r.liked, like_count: r.like_count } : d)
    } catch (e) { setLikeErr((e as Error).message) }
    finally { setLiking(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setSending(true); setFormMsg(null)
    try {
      await call(`/api/blog/${postId}/comments`, { method: 'POST', body: JSON.stringify({ name, body, website }) })
      setName(''); setBody('')
      setFormMsg({ ok: true, text: 'Thanks! Your comment was submitted and is awaiting approval from our team.' })
    } catch (e) { setFormMsg({ ok: false, text: (e as Error).message }) }
    finally { setSending(false) }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1
  const goto = (p: number) => { setPage(p); load(p) }
  const input = 'w-full rounded-lg border border-border bg-ink px-4 py-3 font-body text-paper placeholder:text-ink-muted/70 focus:border-brand-red focus:outline-none'

  return (
    <section aria-label="Likes and comments" className="space-y-10">
      <div className="flex flex-wrap items-center gap-4 border-y border-border py-6">
        {data ? (
          <button type="button" onClick={toggleLike} disabled={liking} aria-pressed={data.liked} data-testid="button-like"
            className={`inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 font-heading text-sm font-bold transition disabled:opacity-60 motion-safe:active:scale-95 ${data.liked ? 'border-brand-red bg-brand-red text-white' : 'border-border text-paper hover:border-brand-red'}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-5 w-5 ${data.liked ? 'fill-white' : 'fill-none stroke-brand-red'}`} strokeWidth="2"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.3 2.4.7-1.3 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" /></svg>
            {liking ? 'Saving...' : data.liked ? 'Liked' : 'Like'}
            <span className="font-body font-semibold opacity-80" data-testid="text-like-count">{data.like_count}</span>
          </button>
        ) : (
          <div className="h-11 w-32 animate-pulse rounded-full bg-surface" />
        )}
        <p className="font-body text-sm text-ink-muted">No account needed. One like per browser.</p>
        {likeErr && <p role="alert" className="w-full font-body text-sm text-brand-red">{likeErr}</p>}
      </div>

      <div>
        <h2 className="font-heading text-2xl font-extrabold text-paper">Comments{data ? ` (${data.total})` : ''}</h2>
        <div className="mt-6 space-y-4" aria-live="polite">
          {loadErr ? (
            <div role="alert" className="rounded-xl border border-brand-red/50 bg-surface p-5 font-body text-sm text-paper">
              {loadErr} <button type="button" onClick={() => load(page)} className="ml-2 font-bold text-brand-red underline" data-testid="button-retry">Retry</button>
            </div>
          ) : !data ? (
            [0, 1].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />)
          ) : data.comments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center font-body text-ink-muted">No comments yet. Be the first to say something.</p>
          ) : data.comments.map(c => (
            <div key={c.id} className="rounded-xl bg-surface p-5" data-testid={`comment-${c.id}`}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue font-heading text-sm font-bold text-white">{c.name.slice(0, 1).toUpperCase()}</span>
                <div><p className="font-heading text-sm font-bold text-paper">{c.name}</p><p className="font-body text-xs text-ink-muted">{fmtDate(c.created_at)}</p></div>
              </div>
              <div className="mt-3 space-y-2 font-body text-paper/90">{paragraphs(c.body).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}</div>
            </div>
          ))}
        </div>
        {data && pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3 font-body text-sm">
            <button type="button" disabled={page <= 1} onClick={() => goto(page - 1)} className="rounded-md border border-border px-3 py-1.5 text-paper disabled:opacity-40">Newer</button>
            <span className="text-ink-muted">{page} / {pages}</span>
            <button type="button" disabled={page >= pages} onClick={() => goto(page + 1)} className="rounded-md border border-border px-3 py-1.5 text-paper disabled:opacity-40">Older</button>
          </div>
        )}
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <h3 className="font-heading text-xl font-extrabold text-paper">Leave a comment</h3>
        <p className="mt-1 font-body text-sm text-ink-muted">All comments are reviewed by our team before they appear.</p>
        <div className="mt-5 space-y-4">
          <label className="block"><span className="mb-1.5 block font-body text-sm font-semibold text-paper">Name</span>
            <input className={input} value={name} onChange={e => setName(e.target.value)} maxLength={80} required data-testid="input-name" /></label>
          <label className="block"><span className="mb-1.5 block font-body text-sm font-semibold text-paper">Comment</span>
            <textarea className={`${input} min-h-[120px]`} value={body} onChange={e => setBody(e.target.value)} maxLength={3000} required data-testid="input-comment" /></label>
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></label>
          </div>
          {formMsg && <p role={formMsg.ok ? 'status' : 'alert'} className={`rounded-lg p-3 font-body text-sm ${formMsg.ok ? 'bg-brand-blue/40 text-paper' : 'bg-brand-red/15 text-paper'}`} data-testid="text-comment-status">{formMsg.text}</p>}
          <button type="submit" disabled={sending || !data} data-testid="button-submit-comment"
            className="rounded-md bg-brand-red px-6 py-3 font-heading text-sm font-bold text-paper transition-colors hover:bg-[#770000] disabled:opacity-50">
            {sending ? 'Sending...' : 'Submit comment'}
          </button>
        </div>
      </form>
    </section>
  )
}
