import type { Metadata } from 'next'
import { unstable_noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { relativeDateLabel, type PublicReview } from '@/lib/google-reviews/public'
import ReviewsCarousel from '@/components/ReviewsCarousel'
import Button from '@/components/ui/Button'
import GoogleReviewsBadge from '@/components/GoogleReviewsBadge'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Reviews | SuperMovers',
  description: 'See what customers say about SuperMovers on Google.',
}

interface PublicStats {
  reviews_url: string | null
  write_review_url: string | null
  average_rating: number | null
  total_review_count: number | null
  stats_source: string | null
  stats_updated_at: string | null
  badge_enabled: boolean
  google_badge_enabled?: boolean
}

async function getReviews(): Promise<{ reviews: PublicReview[]; stats: PublicStats | null }> {
  unstable_noStore()
  try {
    const supabase = createAdminClient()
    const [reviewsResult, statsResult] = await Promise.all([
      supabase.from('google_reviews')
        .select('id, reviewer_name, reviewer_photo_url, star_rating, comment, review_created_at')
        .eq('status', 'published')
        .eq('removed_from_google', false)
        .order('review_created_at', { ascending: false })
        .limit(20),
      supabase.from('google_profile_stats')
        .select('reviews_url, write_review_url, average_rating, total_review_count, stats_source, stats_updated_at, badge_enabled, google_badge_enabled')
        .eq('id', true)
        .single(),
    ])
    if (reviewsResult.error) throw reviewsResult.error
    if (statsResult.error) throw statsResult.error
    const now = new Date()
    const reviews = (reviewsResult.data ?? []).map((review) => ({
      id: review.id,
      name: review.reviewer_name?.trim() || 'Google reviewer',
      photoUrl: review.reviewer_photo_url ?? null,
      rating: review.star_rating,
      comment: review.comment ?? null,
      dateLabel: relativeDateLabel(review.review_created_at, now),
    }))
    // Do not pass internal settings or notes beyond the server-side fetch helper.
    const data = statsResult.data
    return { reviews, stats: {
      reviews_url: data.reviews_url,
      write_review_url: data.write_review_url,
      average_rating: data.average_rating,
      total_review_count: data.total_review_count,
      stats_source: data.stats_source,
      stats_updated_at: data.stats_updated_at,
      badge_enabled: data.badge_enabled === true,
      google_badge_enabled: data.google_badge_enabled === true,
    } }
  } catch (error) {
    console.error('[reviews page]', error)
    return { reviews: [], stats: null }
  }
}

export default async function Reviews() {
  const { reviews, stats } = await getReviews()

  return (
    <main>
      <section className="bg-brand-blue py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-6 lg:gap-10">
          <div className={`order-2 lg:order-1 min-w-0 ${stats?.badge_enabled ? '' : 'hidden lg:block'}`}>
            {stats?.badge_enabled && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src="/satisfaction-badge.svg" alt="Customer satisfaction is always #1" width={1100} height={190} className="w-full max-w-md mx-auto h-auto" />
            )}
          </div>
          <div className="order-1 lg:order-2 text-center min-w-0">
            <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl">Reviews</h1>
            <p className="font-body text-white/80 text-base mt-3">What customers say about us on Google.</p>
          </div>
          <div className={`order-3 min-w-0 ${stats?.google_badge_enabled ? '' : 'hidden lg:block'}`}>
            {stats?.google_badge_enabled && (
              <GoogleReviewImage stats={stats} />
            )}
          </div>
        </div>
      </section>

      <section className="bg-ink py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {reviews.length > 0 ? (
            <ReviewsCarousel reviews={reviews} reviewsUrl={stats?.reviews_url ?? null} />
          ) : (
            <div className="bg-surface border border-border rounded-lg p-8 text-center">
              <h2 className="font-heading font-bold text-paper text-xl">Reviews are on the way</h2>
              <p className="text-ink-muted mt-2">See what customers are saying on Google.</p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {stats?.write_review_url && (
              <Button variant="primary" external href={stats.write_review_url}>Leave a Google review</Button>
            )}
            {stats?.reviews_url && (
              <Button variant="secondary" external href={stats.reviews_url}>See all reviews on Google</Button>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function GoogleReviewImage({ stats }: { stats: PublicStats }) {
  const href = stats.reviews_url
  const image = <GoogleReviewsBadge stats={stats} className="w-full max-w-xs mx-auto h-auto" />
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{image}</a>
    : image
}
