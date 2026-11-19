export function isAllowedGoogleUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ['google.com', 'g.page', 'goo.gl', 'g.co']
      .some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))
  } catch {
    return false
  }
}

export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  return text.length > 0 && text.length <= max ? text : null
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function reviewDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const timestamp = `${value}T12:00:00.000Z`
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null
  if (value < '2010-01-01' || value > new Date().toISOString().slice(0, 10)) return null
  return timestamp
}
