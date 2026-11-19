import Link from 'next/link'
import type { BlogSort } from '@/lib/blog'

const SORTS: { v: BlogSort; l: string }[] = [{ v: 'recent', l: 'Most Recent' }, { v: 'oldest', l: 'Oldest' }, { v: 'popular', l: 'Most Popular' }]
const href = (sort: BlogSort, page: number) => {
  const q = new URLSearchParams()
  if (sort !== 'recent') q.set('sort', sort)
  if (page > 1) q.set('page', String(page))
  const s = q.toString()
  return s ? `/blog?${s}` : '/blog'
}

export function SortTabs({ sort }: { sort: BlogSort }) {
  return (
    <nav aria-label="Sort posts" className="inline-flex gap-1 rounded-full bg-surface p-1">
      {SORTS.map(s => (
        <Link key={s.v} href={href(s.v, 1)} aria-current={s.v === sort ? 'page' : undefined} data-testid={`link-sort-${s.v}`}
          className={`rounded-full px-3 py-2 font-body text-xs font-semibold transition-colors sm:px-5 sm:text-sm ${s.v === sort ? 'bg-brand-red text-white' : 'text-ink-muted hover:text-paper'}`}>
          {s.l}
        </Link>
      ))}
    </nav>
  )
}

export function Pager({ sort, page, pages }: { sort: BlogSort; page: number; pages: number }) {
  if (pages <= 1) return null
  const cls = 'rounded-md border border-border px-4 py-2 font-heading text-sm font-bold transition-colors'
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-3">
      {page > 1 ? <Link className={`${cls} text-paper hover:border-brand-red`} href={href(sort, page - 1)} data-testid="link-prev">Newer page</Link> : <span className={`${cls} text-ink-muted opacity-40`}>Newer page</span>}
      <span className="font-body text-sm text-ink-muted">Page {page} of {pages}</span>
      {page < pages ? <Link className={`${cls} text-paper hover:border-brand-red`} href={href(sort, page + 1)} data-testid="link-next">Next page</Link> : <span className={`${cls} text-ink-muted opacity-40`}>Next page</span>}
    </nav>
  )
}
