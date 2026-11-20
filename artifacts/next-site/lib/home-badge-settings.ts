import { unstable_noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export interface BadgeSettings {
  badge_enabled: boolean
  google_badge_enabled: boolean
  show_satisfaction_badge_home: boolean
  show_google_badge_home: boolean
  show_leave_review_badge_home?: boolean
  show_leave_review_badge_reviews?: boolean
}

export interface BadgeSettingsResult {
  settings: BadgeSettings | null
  homeFlagsReady: boolean
  reviewsUrl: string | null
  averageRating: number | null
  totalReviewCount: number | null
  writeReviewUrl?: string | null
}

// Keep existing Reviews controls usable before the owner applies the home flags SQL.
export async function getBadgeSettings(): Promise<BadgeSettingsResult> {
  unstable_noStore()
  try {
    const client = createAdminClient()
    const result = await client.from('google_profile_stats')
      .select('*')
      .eq('id', true).single()
    if (!result.error) {
      const data = result.data
      const settings: BadgeSettings = {
        badge_enabled: data.badge_enabled === true,
        google_badge_enabled: data.google_badge_enabled === true,
        show_satisfaction_badge_home: data.show_satisfaction_badge_home === true,
        show_google_badge_home: data.show_google_badge_home === true,
        show_leave_review_badge_home: data.show_leave_review_badge_home,
        show_leave_review_badge_reviews: data.show_leave_review_badge_reviews,
      }
      return { settings, homeFlagsReady: typeof data.show_google_badge_home === 'boolean', reviewsUrl: data.reviews_url ?? null, averageRating: data.average_rating ?? null, totalReviewCount: data.total_review_count ?? null, writeReviewUrl: data.write_review_url ?? null }
    }
    const missingHomeColumns = ['42703', 'PGRST204'].includes(result.error.code) &&
      /show_(satisfaction|google)_badge_home/.test(result.error.message)
    if (!missingHomeColumns) throw result.error
    const legacy = await client.from('google_profile_stats')
      .select('badge_enabled, google_badge_enabled, reviews_url').eq('id', true).single()
    if (legacy.error) throw legacy.error
    const { reviews_url, ...settings } = legacy.data
    return {
      settings: { ...settings, show_satisfaction_badge_home: false, show_google_badge_home: false },
      homeFlagsReady: false,
      reviewsUrl: reviews_url ?? null,
      averageRating: null,
      totalReviewCount: null,
    }
  } catch (error) {
    console.error('[badge settings]', error)
    return { settings: null, homeFlagsReady: false, reviewsUrl: null, averageRating: null, totalReviewCount: null }
  }
}

export async function getHomeBadgeSettings() {
  const { settings, reviewsUrl, averageRating, totalReviewCount, writeReviewUrl } = await getBadgeSettings()
  return {
    show_satisfaction_badge_home: settings?.show_satisfaction_badge_home === true,
    show_google_badge_home: settings?.show_google_badge_home === true,
    reviews_url: reviewsUrl,
    average_rating: averageRating,
    total_review_count: totalReviewCount,
    show_leave_review_badge_home: settings?.show_leave_review_badge_home === true,
    write_review_url: writeReviewUrl,
  }
}
