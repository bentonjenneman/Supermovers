import type { ReactNode } from 'react'
import Link from 'next/link'
import LogoutButton from '@/components/admin/LogoutButton'

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav>
        <Link href="/admin/dashboard/quotes">Quotes</Link>
        <Link href="/admin/dashboard/reviews">Reviews</Link>
        <Link href="/admin/dashboard/tracking">Tracking</Link>
        <LogoutButton />
      </nav>
      {children}
    </>
  )
}
