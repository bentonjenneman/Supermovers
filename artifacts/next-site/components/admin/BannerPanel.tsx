'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { EMPTY_BANNER, type BannerSettings } from '@/lib/banner'
import type { BannerResult } from '@/lib/banner-settings'
import { NETWORK, inputCls, labelCls, readError } from './google-reviews/utils'
import HomeBanner from '@/components/home/HomeBanner'

export default function BannerPanel({ settings }: { settings: BannerResult }) {
  const router = useRouter()
  const [values, setValues] = useState<BannerSettings>(settings.banner ?? EMPTY_BANNER)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const previousSettings = useRef(settings.banner)
  useEffect(() => {
    if (settings.banner === previousSettings.current) return
    previousSettings.current = settings.banner
    if (!dirty && settings.banner) setValues(settings.banner)
  }, [settings.banner, dirty])

  function change(field: keyof BannerSettings, value: string) {
    setValues(current => ({ ...current, [field]: value }))
    setDirty(true)
    setError('')
    setSuccess('')
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || settings.error) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const response = await fetch('/api/admin/banner', {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!response.ok) { setError(await readError(response)); return }
      const result = await response.json() as { banner: BannerSettings }
      setValues(result.banner)
      setSuccess(result.banner.title ? 'Banner saved.' : 'Banner hidden.')
      setDirty(false)
      router.refresh()
    } catch {
      setError(NETWORK)
    } finally {
      setBusy(false)
    }
  }

  return (
    <details className="group rounded-lg border border-border bg-surface">
      <summary className="cursor-pointer list-none p-4 font-heading font-bold marker:hidden">
        <span className="mr-2 inline-block text-brand-red transition-transform group-open:rotate-90" aria-hidden="true">›</span>
        Banner
      </summary>
      <form onSubmit={save} className="space-y-4 border-t border-border p-4" aria-busy={busy}>
        {settings.error && <p role="alert" className="text-sm text-red-400">{settings.error === 'setup' ? 'Run the supplied banner SQL in Supabase, then refresh the Editor to enable saving.' : 'Could not load the banner settings. Refresh to try again.'}</p>}
        <fieldset disabled={busy || !!settings.error} className="space-y-4">
          <div>
            <label htmlFor="banner-title" className={labelCls}>Title</label>
            <input id="banner-title" name="title" type="text" maxLength={160} value={values.title} onChange={e => change('title', e.target.value)} className={inputCls} aria-describedby="banner-title-help" />
            <p id="banner-title-help" className="mt-1 text-sm text-ink-muted">Leave the title empty and save to hide the banner.</p>
          </div>
          <div>
            <label htmlFor="banner-subtitle" className={labelCls}>Subtitle</label>
            <input id="banner-subtitle" name="subtitle" type="text" maxLength={300} value={values.subtitle} onChange={e => change('subtitle', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="banner-link" className={labelCls}>Link</label>
            <input id="banner-link" name="link" type="text" inputMode="url" placeholder="/quote or https://example.com" maxLength={2048} value={values.link} onChange={e => change('link', e.target.value)} className={inputCls} aria-describedby="banner-link-help" />
            <p id="banner-link-help" className="mt-1 text-sm text-ink-muted">Add a link that opens if the banner is pressed</p>
          </div>
          {values.title.trim() && (
            <div className="space-y-2">
              <p className={labelCls}>Preview</p>
              <div className="overflow-hidden rounded-md">
                <HomeBanner banner={{ ...values, title: values.title.trim(), link: '' }} />
              </div>
            </div>
          )}
          <button type="submit" disabled={busy || !dirty} className="min-h-[44px] rounded-md bg-brand-red px-5 py-3 font-heading text-sm font-bold text-paper hover:bg-[#770000] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper">
            {busy ? 'Saving…' : 'Save Banner'}
          </button>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        {success && <p role="status" className="text-sm text-emerald-400">{success}</p>}
      </form>
    </details>
  )
}
