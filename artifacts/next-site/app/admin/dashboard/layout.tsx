import type { ReactNode } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
import LogoutButton from '@/components/admin/LogoutButton'
import AdminNav from '@/components/admin/AdminNav'

async function getCounts(): Promise<{ newQuotes: number; pendingReviews: number }> {
  try {
    const supabase = createAdminClient()
    const [quotesRes, reviewsRes] = await Promise.all([
      supabase
        .from('quotes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('published', false),
    ])
    return {
      newQuotes: quotesRes.count ?? 0,
      pendingReviews: reviewsRes.count ?? 0,
    }
  } catch {
    return { newQuotes: 0, pendingReviews: 0 }
  }
}

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { newQuotes, pendingReviews } = await getCounts()

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <div className="bg-ink border-b border-border px-6 py-4 flex justify-between items-center">
        <span className="font-heading font-bold text-paper text-lg">Super Movers Admin</span>
        <LogoutButton />
      </div>

      {/* Tab bar */}
      <div className="px-6 py-4">
        <AdminNav newQuotes={newQuotes} pendingReviews={pendingReviews} />
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {children}
      </div>
    </div>
  )
}
