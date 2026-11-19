export type PublicReview = {
  id: string
  name: string
  photoUrl: string | null
  rating: number
  comment: string | null
  dateLabel: string
}

export function relativeDateLabel(iso: string, now = new Date()): string {
  const time = new Date(iso).getTime()
  if (!Number.isFinite(time)) return ''
  const days = Math.max(0, Math.floor((now.getTime() - time) / 86_400_000))
  if (days === 0) return 'today'
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  if (days < 35) {
    const weeks = Math.floor(days / 7)
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  }
  if (days < 365) {
    const months = Math.min(11, Math.max(1, Math.floor(days / 30)))
    return months === 1 ? 'a month ago' : `${months} months ago`
  }
  const years = Math.floor(days / 365)
  return years === 1 ? 'a year ago' : `${years} years ago`
}
