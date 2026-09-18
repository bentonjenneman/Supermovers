'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  newQuotes: number
  pendingReviews: number
}

export default function AdminNav({ newQuotes, pendingReviews }: Props) {
  const pathname = usePathname()

  const tabs = [
    { href: '/admin/dashboard/quotes', label: 'Quotes', badge: newQuotes },
    { href: '/admin/dashboard/reviews', label: 'Reviews', badge: pendingReviews },
    { href: '/admin/dashboard/tracking', label: 'Tracking', badge: 0 },
  ]

  return (
    <nav aria-label="Admin sections" className="bg-surface rounded-full p-1 inline-flex gap-1 min-w-max">
      {tabs.map(({ href, label, badge }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={`px-3 sm:px-5 py-2 rounded-full font-body font-semibold text-xs sm:text-sm transition-colors inline-flex items-center ${
              active ? 'bg-ink text-paper shadow-sm' : 'text-ink-muted hover:text-paper'
            }`}
          >
            {label}
            {badge > 0 && (
              <span className="inline-flex ml-1.5 bg-brand-red text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                {badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
