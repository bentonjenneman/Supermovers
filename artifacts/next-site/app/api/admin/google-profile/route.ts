export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { isAllowedGoogleUrl, isRecord } from '@/lib/google-reviews/validation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request); if (denied) return denied
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  if (!isRecord(body)) return NextResponse.json({ error: 'Invalid profile settings.' }, { status: 400 })
  const urls: Record<string, string | null> = {}
  for (const field of ['reviews_url', 'write_review_url']) {
    const value = body[field]
    if (value === '' || value === null) urls[field] = null
    else if (typeof value === 'string' && isAllowedGoogleUrl(value)) urls[field] = value
    else return NextResponse.json({ error: 'That link must be a Google link (https).' }, { status: 400 })
  }
  const rating = body.average_rating
  const count = body.total_review_count
  if (rating !== null && (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 1 || rating > 5)) {
    return NextResponse.json({ error: 'Average rating must be a number from 1 to 5, or blank.' }, { status: 400 })
  }
  if (count !== null && (typeof count !== 'number' || !Number.isSafeInteger(count) || count < 0)) {
    return NextResponse.json({ error: 'Review count must be a non-negative integer, or blank.' }, { status: 400 })
  }
  try {
    const supabase = createAdminClient()
    const { data: stats, error: loadError } = await supabase.from('google_profile_stats')
      .select('*').eq('id', true).single()
    if (loadError) throw loadError
    const updates: Record<string, unknown> = { ...urls }
    if (stats.stats_source !== 'api') {
      const rounded = typeof rating === 'number' ? Math.round(rating * 10) / 10 : null
      updates.average_rating = rounded
      updates.total_review_count = count
      if (rounded !== stats.average_rating || count !== stats.total_review_count) {
        updates.stats_updated_at = new Date().toISOString()
        updates.stats_source = 'manual'
      }
    }
    const { error } = await supabase.from('google_profile_stats').update(updates).eq('id', true)
    if (error) throw error
    return NextResponse.json({})
  } catch (error) {
    console.error('[admin/google-profile PUT]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
