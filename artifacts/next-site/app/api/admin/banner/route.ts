export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { validateBanner } from '@/lib/banner'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMissingBannerTable } from '@/lib/banner-settings'

export async function PUT(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }
  const result = validateBanner(body)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 })
  try {
    const { error } = await createAdminClient().from('site_banner')
      .upsert({ id: true, ...result.data }, { onConflict: 'id' }).select('id').single()
    if (error) {
      if (isMissingBannerTable(error)) {
        return NextResponse.json({ error: 'Run the supplied banner SQL in Supabase, then refresh the Editor.' }, { status: 503 })
      }
      throw error
    }
    return NextResponse.json({ banner: result.data })
  } catch (error) {
    console.error('[admin/banner PUT]', error)
    return NextResponse.json({ error: 'Could not save the banner. Please try again.' }, { status: 500 })
  }
}
