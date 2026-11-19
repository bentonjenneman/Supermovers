'use client'

import { useCallback, useEffect, useState } from 'react'
import type { BlogPost } from '@/lib/blog'
import { adminCall, btn } from './api'
import PostEditor from './PostEditor'
import CommentModeration from './CommentModeration'

export default function BlogAdmin() {
  const [tab, setTab] = useState<'posts' | 'comments'>('posts')
  const [posts, setPosts] = useState<BlogPost[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [err, setErr] = useState('')
  const [editing, setEditing] = useState<BlogPost | 'new' | null>(null)

  const load = useCallback(async (p: number) => {
    setErr('')
    try { const r = await adminCall<{ posts: BlogPost[]; total: number }>(`/api/admin/blog?page=${p}`); setPosts(r.posts); setTotal(r.total) }
    catch (e) { setErr((e as Error).message) }
  }, [])
  useEffect(() => { load(page) }, [load, page])

  const pages = Math.max(1, Math.ceil(total / 20))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-paper">Blog</h1>
          <p className="font-body text-sm text-ink-muted">Write stories, share videos, and moderate comments.</p>
        </div>
        <div className="inline-flex gap-1 rounded-full bg-surface p-1">
          {(['posts', 'comments'] as const).map(t => (
            <button key={t} type="button" onClick={() => setTab(t)} data-testid={`tab-${t}`}
              className={`rounded-full px-4 py-1.5 font-body text-sm font-semibold capitalize transition-colors ${tab === t ? 'bg-brand-red text-white' : 'text-ink-muted hover:text-paper'}`}>{t}</button>
          ))}
        </div>
      </div>

      {tab === 'comments' ? <CommentModeration /> : editing ? (
        <PostEditor key={editing === 'new' ? 'new' : editing.id} initial={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={p => { setEditing(p); load(page) }}
          onDeleted={() => { setEditing(null); load(page) }} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-ink-muted">{posts ? `${total} ${total === 1 ? 'post' : 'posts'}` : 'Loading posts...'}</p>
            <button type="button" onClick={() => setEditing('new')} className={`${btn} bg-brand-red text-white hover:bg-[#770000]`} data-testid="button-new-post">New post</button>
          </div>
          {err ? (
            <div role="alert" className="rounded-xl border border-brand-red/50 bg-surface p-5 font-body text-sm text-paper">{err}
              <button type="button" onClick={() => load(page)} className="ml-3 font-bold text-brand-red underline">Retry</button></div>
          ) : !posts ? (
            [0, 1, 2].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />)
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="font-heading text-lg font-bold text-paper">No posts yet</p>
              <p className="mt-1 font-body text-sm text-ink-muted">Start with a moving tip or a crew story.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {posts.map(p => (
                <li key={p.id}>
                  <button type="button" onClick={() => setEditing(p)} data-testid={`row-post-${p.id}`}
                    className="flex w-full flex-wrap items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-ink/50">
                    <span className={`rounded-full px-2.5 py-0.5 font-body text-xs font-bold uppercase ${p.status === 'published' ? 'bg-brand-blue text-white' : 'bg-ink text-ink-muted'}`}>{p.status}</span>
                    <span className="rounded-full border border-border px-2.5 py-0.5 font-body text-xs text-ink-muted">{p.kind}</span>
                    <span className="min-w-0 flex-1 truncate font-heading font-bold text-paper">{p.title || 'Untitled'}</span>
                    <span className="font-body text-xs text-ink-muted">{p.like_count} likes / {p.comment_count} comments</span>
                    <span className="font-body text-xs text-ink-muted">Updated {new Date(p.updated_at).toLocaleDateString()}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 font-body text-sm">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={`${btn} border border-border text-paper`}>Previous</button>
              <span className="text-ink-muted">{page} / {pages}</span>
              <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={`${btn} border border-border text-paper`}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
