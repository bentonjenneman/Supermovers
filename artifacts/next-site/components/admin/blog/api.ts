export async function adminCall<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', cache: 'no-store', ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) { const err = new Error(body?.error || `Request failed (${res.status}).`) as Error & { status?: number }; err.status = res.status; throw err }
  return body as T
}
export const btn = 'rounded-md px-4 py-2 font-heading text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
export const field = 'w-full rounded-lg border border-border bg-ink px-3 py-2.5 font-body text-sm text-paper placeholder:text-ink-muted/60 focus:border-brand-red focus:outline-none'
