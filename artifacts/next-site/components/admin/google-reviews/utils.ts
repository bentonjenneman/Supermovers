export const GENERIC = 'Something went wrong. Please try again.'
export const NETWORK = 'Network error. Check your connection and try again.'

export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function todayISO(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export async function readError(res: Response): Promise<string> {
  try {
    const j = await res.json()
    if (j && typeof j.error === 'string') return j.error
  } catch {}
  return GENERIC
}

export const inputCls =
  'w-full rounded-md border border-border bg-ink px-3 py-2 text-sm text-paper placeholder:text-ink-muted/60 focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red disabled:opacity-60'
export const labelCls = 'mb-1 block text-xs font-heading font-bold uppercase tracking-wider text-ink-muted'
export const smallBtn = 'px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed'
