import { createAdminClient } from '@/lib/supabase/admin'
import LeaveReviewForm from '@/components/LeaveReviewForm'

interface Review {
  id: string
  name: string
  rating: number
  review_text: string
  created_at: string
}

async function getPublishedReviews(): Promise<Review[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, rating, review_text, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[reviews] Failed to fetch reviews:', error)
    return []
  }

  return (data ?? []) as Review[]
}

export default async function Reviews() {
  const reviews = await getPublishedReviews()

  return (
    <main>
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-14 text-center px-4">
        <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl">
          Reviews
        </h1>
        <p className="font-body text-white/80 text-base mt-3">
          See what people are saying — or leave your own.
        </p>
      </section>

      {/* ── PUBLISHED REVIEWS ────────────────────────────────────────────── */}
      <section className="bg-paper py-16">
        <div className="max-w-2xl mx-auto px-4">
          {reviews.length === 0 ? (
            <p className="font-body text-ink-muted text-center py-8">
              No reviews yet.
            </p>
          ) : (
            <div>
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border border-border rounded-lg p-5 mb-4"
                >
                  <p className="font-heading font-bold text-ink text-sm">{r.name}</p>
                  <p className="text-brand-orange text-sm mt-1">
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    {' '}
                    <span>{r.rating}/5</span>
                  </p>
                  <p className="font-body text-ink-muted text-sm mt-2">{r.review_text}</p>
                  <p className="font-body text-xs text-ink-muted/60 mt-2">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <LeaveReviewForm />
        </div>
      </section>
    </main>
  )
}
