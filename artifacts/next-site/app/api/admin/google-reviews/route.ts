export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { cleanText, isRecord, reviewDate } from '@/lib/google-reviews/validation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request); if (denied) return denied
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  if (!isRecord(body)) return NextResponse.json({ error: 'Invalid review.' }, { status: 400 })
  const name = cleanText(body.reviewer_name, 100)
  const date = reviewDate(body.review_created_at)
  const rating = body.star_rating
  const comment = body.comment === undefined || body.comment === '' ? null : cleanText(body.comment, 4000)
  if (!name || typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5 || !date) {
    return NextResponse.json({ error: 'Enter a name, a rating from 1 to 5, and a valid date from 2010 through today.' }, { status: 400 })
  }
  if (body.comment !== undefined && (typeof body.comment !== 'string' || body.comment.trim().length > 4000)) {
    return NextResponse.json({ error: 'Review text must be at most 4000 characters.' }, { status: 400 })
  }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('google_reviews').insert({
      reviewer_name: name, star_rating: rating, comment, review_created_at: date,
      source: 'manual', status: 'published', google_review_id: null, reviewer_photo_url: null,
    }).select('id').single()
    if (error) throw error
    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (error) {
    console.error('[admin/google-reviews POST]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
