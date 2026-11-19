export type GoogleReviewStatus = 'pending' | 'published' | 'hidden'

export interface GoogleReview {
  id: string
  source: 'manual' | 'api' | string
  status: GoogleReviewStatus
  reviewer_name: string
  star_rating: number
  comment: string | null
  review_created_at: string
  google_review_id?: string | null
  reviewer_photo_url?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface GoogleProfileStats {
  id: true
  reviews_url: string | null
  write_review_url: string | null
  average_rating: number | null
  total_review_count: number | null
  stats_source: 'manual' | 'api' | string
  stats_updated_at: string | null
  last_synced_at: string | null
  last_sync_error: string | null
}
