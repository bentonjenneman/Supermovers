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
      <h1>Reviews</h1>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong> — {r.rating}/5
              <p>{r.review_text}</p>
            </li>
          ))}
        </ul>
      )}

      <LeaveReviewForm />
    </main>
  )
}
