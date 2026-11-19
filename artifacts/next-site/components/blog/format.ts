export function fmtDate(v: string | null) {
  if (!v) return ''
  return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })
}
export function paragraphs(text: string) {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
}
