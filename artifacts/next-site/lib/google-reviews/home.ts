import { unstable_noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { relativeDateLabel, type PublicReview } from './public'

export async function getHomeReviews(): Promise<PublicReview[] | null> {
  unstable_noStore()
  try {
    const { data, error } = await createAdminClient().from('google_reviews')
      .select('id, reviewer_name, star_rating, comment, review_created_at')
      .eq('status', 'published')
      .eq('removed_from_google', false)
      .order('review_created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(3)
    if (error) throw error
    const now = new Date()
    return (data ?? []).map((review) => ({
      id: review.id,
      name: review.reviewer_name?.trim() || 'Google reviewer',
      photoUrl: null,
      rating: review.star_rating,
      comment: review.comment ?? null,
      dateLabel: relativeDateLabel(review.review_created_at, now),
    }))
  } catch (error) {
    console.error('[home reviews]', error)
    return null
  }
}
