export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { isRecord } from '@/lib/google-reviews/validation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request); if (denied) return denied
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  if (!isRecord(body) || typeof body.badge_enabled !== 'boolean' ||
    typeof body.google_badge_enabled !== 'boolean') {
    return NextResponse.json({ error: 'Invalid badge settings.' }, { status: 400 })
  }
  const hasHomeSettings = 'show_satisfaction_badge_home' in body || 'show_google_badge_home' in body
  if (hasHomeSettings && (typeof body.show_satisfaction_badge_home !== 'boolean' ||
    typeof body.show_google_badge_home !== 'boolean')) {
    return NextResponse.json({ error: 'Invalid home-page badge settings.' }, { status: 400 })
  }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('google_profile_stats').update({
      badge_enabled: body.badge_enabled,
      google_badge_enabled: body.google_badge_enabled,
      ...(hasHomeSettings ? {
        show_satisfaction_badge_home: body.show_satisfaction_badge_home,
        show_google_badge_home: body.show_google_badge_home,
      } : {}),
    }).eq('id', true).select('id').single()
    if (error) throw error
    return NextResponse.json({})
  } catch (error) {
    console.error('[admin/reviews-badges PUT]', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
