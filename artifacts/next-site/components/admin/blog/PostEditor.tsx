'use client'

import { useEffect, useRef, useState } from 'react'
import { EMPTY_POST, postImage, validatePost, youtubeId, type BlogInput, type BlogPost } from '@/lib/blog'
import { adminCall, btn, field } from './api'

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180)
const pick = (p: BlogPost): BlogInput => ({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content ?? '', kind: p.kind, image_url: p.image_url, youtube_url: p.youtube_url, status: p.status })

interface Props { initial: BlogPost | null; onClose: () => void; onSaved: (p: BlogPost) => void; onDeleted: () => void }

export default function PostEditor({ initial, onClose, onSaved, onDeleted }: Props) {
  const [post, setPost] = useState<BlogPost | null>(initial)
  const [form, setForm] = useState<BlogInput>(initial ? pick(initial) : EMPTY_POST)
  const [slugTouched, setSlugTouched] = useState(!!initial)
  const [busy, setBusy] = useState<'' | 'draft' | 'publish' | 'delete' | 'upload' | 'load'>('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string; conflict?: boolean } | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)
  const [dirty, setDirtyState] = useState(false)
  const dirtyRef = useRef(false)
  const setDirty = (v: boolean) => { dirtyRef.current = v; setDirtyState(v) }

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current) { event.preventDefault(); event.returnValue = '' }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  const set = <K extends keyof BlogInput>(k: K, v: BlogInput[K]) => {
    setDirty(true)
    setForm(f => {
      const n = { ...f, [k]: v }
      if (k === 'title' && !slugTouched) n.slug = slugify(String(v))
      return n
    })
  }

  useEffect(() => {
    if (!initial) return
    let live = true
    setBusy('load')
    adminCall<{ post: BlogPost }>(`/api/admin/blog/${initial.id}`)
      .then(r => { if (live) { setPost(r.post); setForm(f => dirtyRef.current ? f : pick(r.post)) } })
      .catch(e => { if (live) setMsg({ ok: false, text: (e as Error).message }) })
      .finally(() => { if (live) setBusy('') })
    return () => { live = false }
  }, [initial])

  async function save(status: 'draft' | 'published') {
    const payload = { ...form, status }
    const v = validatePost(payload)
    if ('error' in v) { setMsg({ ok: false, text: v.error }); return }
    setBusy(status === 'draft' ? 'draft' : 'publish'); setMsg(null)
    try {
      const r = post
        ? await adminCall<{ post: BlogPost }>(`/api/admin/blog/${post.id}`, { method: 'PUT', body: JSON.stringify({ ...v.data, updated_at: post.updated_at }) })
        : await adminCall<{ post: BlogPost }>('/api/admin/blog', { method: 'POST', body: JSON.stringify(v.data) })
      setPost(r.post); setForm(pick(r.post)); setDirty(false); setSlugTouched(true)
      setMsg({ ok: true, text: status === 'published' ? 'Published. The post is live on the blog.' : 'Saved as draft. It is not visible publicly.' })
      onSaved(r.post)
    } catch (e) {
      const s = (e as { status?: number }).status
      setMsg(s === 409
        ? { ok: false, conflict: true, text: 'This post was changed somewhere else. Your edits are kept here, but saving would overwrite newer changes. Reload the latest version (your unsaved edits will be lost) or copy your text first.' }
        : { ok: false, text: (e as Error).message })
    } finally { setBusy('') }
  }

  async function reload() {
    if (!post) return
    setBusy('load')
    try { const r = await adminCall<{ post: BlogPost }>(`/api/admin/blog/${post.id}`); setPost(r.post); setForm(pick(r.post)); setDirty(false); setMsg({ ok: true, text: 'Reloaded the latest version.' }) }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }) }
    finally { setBusy('') }
  }

  async function del() {
    if (!post) return
    setBusy('delete'); setMsg(null)
    try { await adminCall(`/api/admin/blog/${post.id}`, { method: 'DELETE', body: JSON.stringify({ updated_at: post.updated_at }) }); onDeleted() }
    catch (e) { setMsg({ ok: false, text: (e as Error).message, conflict: (e as { status?: number }).status === 409 }); setConfirmDel(false) }
    finally { setBusy('') }
  }

  async function upload(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setMsg({ ok: false, text: 'Use a JPEG, PNG, or WebP image.' }); return }
    if (file.size > 5 * 1024 * 1024) { setMsg({ ok: false, text: 'Images must be 5 MB or smaller.' }); return }
    setBusy('upload'); setMsg(null)
    try {
      const { signedUrl, publicUrl } = await adminCall<{ signedUrl: string; publicUrl: string }>('/api/admin/blog/images', { method: 'POST', body: JSON.stringify({ name: file.name, size: file.size, type: file.type }) })
      const res = await fetch(signedUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file })
      if (!res.ok) throw new Error('The image upload failed. Please try again.')
      set('image_url', publicUrl)
      setMsg({ ok: true, text: 'Image uploaded. Save to keep it.' })
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }) }
    finally { setBusy('') }
  }

  const preview = postImage(form)
  const ytOk = !form.youtube_url || !!youtubeId(form.youtube_url)
  const label = 'mb-1.5 block font-body text-xs font-bold uppercase tracking-wider text-ink-muted'

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" disabled={!!busy} onClick={() => { if (!dirty || window.confirm('Discard your unsaved changes?')) onClose() }} className="font-body text-sm font-semibold text-ink-muted hover:text-paper disabled:opacity-50" data-testid="button-back-posts">{'<-'} All posts</button>
        <div className="flex items-center gap-2 font-body text-xs">
          <span className={`rounded-full px-2.5 py-1 font-bold uppercase ${post?.status === 'published' ? 'bg-brand-blue text-white' : 'bg-ink text-ink-muted'}`} data-testid="status-post">{post ? post.status : 'new draft'}</span>
          {dirty && <span className="text-brand-red">Unsaved changes</span>}
          {post?.status === 'published' && <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-paper underline">View live</a>}
        </div>
      </div>

      <fieldset disabled={!!busy} className="min-w-0 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div>
            <span className={label}>Post type</span>
            <div className="inline-flex gap-1 rounded-full bg-ink p-1">
              {(['text', 'video'] as const).map(k => (
                <button key={k} type="button" onClick={() => set('kind', k)} data-testid={`button-kind-${k}`}
                  className={`rounded-full px-4 py-1.5 font-body text-sm font-semibold transition-colors ${form.kind === k ? 'bg-brand-red text-white' : 'text-ink-muted hover:text-paper'}`}>{k === 'text' ? 'Text story' : 'YouTube video'}</button>
              ))}
            </div>
          </div>
          <label className="block"><span className={label}>Title</span>
            <input className={`${field} text-base font-semibold`} value={form.title} maxLength={180} onChange={e => set('title', e.target.value)} data-testid="input-title" /></label>
          <label className="block"><span className={label}>URL slug</span>
            <div className="flex items-center rounded-lg border border-border bg-ink pl-3 focus-within:border-brand-red">
              <span className="font-body text-sm text-ink-muted">/blog/</span>
              <input className="w-full bg-transparent py-2.5 pr-3 font-body text-sm text-paper focus:outline-none" value={form.slug} maxLength={180}
                onChange={e => { setSlugTouched(true); set('slug', e.target.value.toLowerCase()) }} data-testid="input-slug" />
            </div></label>
          <label className="block"><span className={label}>Excerpt (shown on cards)</span>
            <textarea className={`${field} min-h-[80px]`} value={form.excerpt} maxLength={500} onChange={e => set('excerpt', e.target.value)} data-testid="input-excerpt" /></label>
          {form.kind === 'video' && (
            <label className="block"><span className={label}>YouTube URL</span>
              <input className={field} value={form.youtube_url} placeholder="https://www.youtube.com/watch?v=..." onChange={e => set('youtube_url', e.target.value)} data-testid="input-youtube" />
              {!ytOk && <span className="mt-1 block font-body text-xs text-brand-red">That does not look like a valid YouTube link.</span>}</label>
          )}
          <label className="block"><span className={label}>{form.kind === 'video' ? 'Additional notes (optional)' : 'Article'}</span>
            <textarea className={`${field} min-h-[300px] leading-relaxed`} value={form.content} maxLength={50000} placeholder="Separate paragraphs with a blank line." onChange={e => set('content', e.target.value)} data-testid="input-content" /></label>
        </div>

        <aside className="space-y-4">
          <div>
            <span className={label}>Cover image</span>
            <div className="aspect-video overflow-hidden rounded-lg border border-border bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview ? <img src={preview} alt="Cover preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-body text-xs text-ink-muted">No image</div>}
            </div>
            {form.kind === 'video' && !form.image_url && preview && <p className="mt-1 font-body text-xs text-ink-muted">Using the YouTube thumbnail.</p>}
            <input aria-label="Cover image URL" className={`${field} mt-2`} value={form.image_url} placeholder="https://... image URL" onChange={e => set('image_url', e.target.value)} data-testid="input-image-url" />
            <div className="mt-2 flex gap-2">
              <label className={`${btn} cursor-pointer border border-border text-paper hover:border-brand-red ${busy ? 'pointer-events-none opacity-50' : ''}`}>
                {busy === 'upload' ? 'Uploading...' : 'Upload image'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" data-testid="input-upload"
                  onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f) }} />
              </label>
              {form.image_url && <button type="button" onClick={() => set('image_url', '')} className={`${btn} text-ink-muted hover:text-paper`}>Remove</button>}
            </div>
            <p className="mt-1 font-body text-xs text-ink-muted">JPEG, PNG, or WebP up to 5 MB.</p>
          </div>
          <div className="rounded-lg bg-ink p-4 font-body text-xs leading-relaxed text-ink-muted">
            <p className="font-bold text-paper">To publish</p>
            {form.kind === 'text' ? <p>Text stories need a title, excerpt, cover image, and article text.</p> : <p>Videos need a title, excerpt, and YouTube link.</p>}
          </div>
        </aside>
      </fieldset>

      {msg && (
        <div role={msg.ok ? 'status' : 'alert'} className={`mt-6 rounded-lg p-4 font-body text-sm text-paper ${msg.ok ? 'bg-brand-blue/40' : 'border border-brand-red/50 bg-brand-red/10'}`} data-testid="text-editor-status">
          {msg.text}
          {msg.conflict && <button type="button" onClick={reload} disabled={!!busy} className="ml-3 font-bold text-brand-red underline">Reload latest</button>}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button type="button" disabled={!!busy} onClick={() => save('published')} className={`${btn} bg-brand-red text-white hover:bg-[#770000]`} data-testid="button-publish">
          {busy === 'publish' ? 'Saving...' : post?.status === 'published' ? 'Save changes' : 'Publish'}
        </button>
        <button type="button" disabled={!!busy} onClick={() => save('draft')} className={`${btn} border border-border text-paper hover:border-paper`} data-testid="button-save-draft">
          {busy === 'draft' ? 'Saving...' : post?.status === 'published' ? 'Unpublish to draft' : 'Save draft'}
        </button>
        {post && (confirmDel ? (
          <div className="ml-auto flex flex-wrap items-center gap-2 rounded-lg border border-brand-red/50 p-3">
            <span className="font-body text-sm text-paper">Delete permanently? This removes the post and all its likes and comments.</span>
            <button type="button" disabled={!!busy} onClick={del} className={`${btn} bg-brand-red text-white`} data-testid="button-confirm-delete">{busy === 'delete' ? 'Deleting...' : 'Delete'}</button>
            <button type="button" onClick={() => setConfirmDel(false)} className={`${btn} text-ink-muted`}>Cancel</button>
          </div>
        ) : (
          <button type="button" disabled={!!busy} onClick={() => setConfirmDel(true)} className={`${btn} ml-auto text-brand-red hover:bg-brand-red/10`} data-testid="button-delete">Delete post</button>
        ))}
      </div>
    </div>
  )
}
