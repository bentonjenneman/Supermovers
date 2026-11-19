export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { isRecord, isUuid } from '@/lib/google-reviews/validation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request); if (denied) return denied
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Invalid review ID.' }, { status: 400 })
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  if (!isRecord(body) || !['pending', 'published', 'hidden'].includes(body.status as string)) {
    return NextResponse.json({ error: 'Invalid review status.' }, { status: 400 })
  }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from('google_reviews').update({ status: body.status })
      .eq('id', params.id).select('id')
    if (error) throw error
    if (!data?.length) return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
    return NextResponse.json({})
  } catch (error) {
    console.error('[admin/google-reviews PATCH]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request); if (denied) return denied
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Invalid review ID.' }, { status: 400 })
  try {
    const supabase = createAdminClient()
    const { data: review, error: selectError } = await supabase.from('google_reviews')
      .select('source').eq('id', params.id).maybeSingle()
    if (selectError) throw selectError
    if (!review) return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
    if (review.source !== 'manual') {
      return NextResponse.json({ error: 'Synced reviews can only be hidden, not deleted.' }, { status: 409 })
    }
    const { error } = await supabase.from('google_reviews').delete().eq('id', params.id).eq('source', 'manual')
    if (error) throw error
    return NextResponse.json({})
  } catch (error) {
    console.error('[admin/google-reviews DELETE]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
