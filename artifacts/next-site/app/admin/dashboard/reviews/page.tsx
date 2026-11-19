import { unstable_noStore } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidAdminCookie } from '@/lib/admin/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import GoogleReviewsAdmin from '@/components/admin/GoogleReviewsAdmin'
import type { GoogleReview, GoogleProfileStats } from '@/lib/google-reviews/types'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export interface Review {
  id: string
  session_id: string | null
  name: string
  rating: number
  review_text: string
  published: boolean
  created_at: string
}

async function getReviews() {
  unstable_noStore()
  try {
    const supabase = createAdminClient()
    const [reviews, stats] = await Promise.all([
      supabase.from('google_reviews').select('*').order('review_created_at', { ascending: false }),
      supabase.from('google_profile_stats').select('last_synced_at, last_sync_error').eq('id', true).single(),
    ])
    if (reviews.error) throw reviews.error
    if (stats.error) throw stats.error
    return { reviews: (reviews.data ?? []) as GoogleReview[], stats: stats.data as Pick<GoogleProfileStats, 'last_synced_at' | 'last_sync_error'>, failed: false }
  } catch (error) {
    console.error('[admin/google-reviews page]', error)
    return { reviews: [] as GoogleReview[], stats: null, failed: true }
  }
}

export default async function ReviewsPage() {
  if (!isValidAdminCookie(cookies().get('admin_session')?.value)) redirect('/admin')
  const { reviews, stats, failed } = await getReviews()

  return (
    <main>
      <h1 className="font-heading font-extrabold text-paper text-2xl sm:text-3xl mb-5">Reviews</h1>
      {failed && <p role="alert" className="text-red-400 mb-4">Couldn&apos;t load reviews. Refresh to try again.</p>}
      <GoogleReviewsAdmin reviews={reviews} stats={stats} />
    </main>
  )
}
