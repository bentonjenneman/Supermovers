import { createAdminClient } from '@/lib/supabase/admin'
import ReviewsQueue from '@/components/admin/ReviewsQueue'

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

async function getReviews(): Promise<Review[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/reviews] Failed to fetch reviews:', error)
    return []
  }

  return (data ?? []) as Review[]
}

export default async function ReviewsPage() {
  const reviews = await getReviews()
  const pending = reviews.filter((r) => r.published === false)
  const published = reviews.filter((r) => r.published === true)

  return (
    <main>
      <h1>Reviews</h1>
      <ReviewsQueue pendingReviews={pending} publishedReviews={published} />
    </main>
  )
}
