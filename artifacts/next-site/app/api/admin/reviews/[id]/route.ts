import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { published } = body as Record<string, unknown>

  if (typeof published !== 'boolean') {
    return NextResponse.json(
      { error: 'published must be a boolean (true or false)' },
      { status: 400 },
    )
  }

  const { id } = params

  let supabase: ReturnType<typeof createAdminClient>
  try {
    supabase = createAdminClient()
  } catch (err) {
    console.error('[admin/reviews] Admin client init failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  const { data, error } = await supabase
    .from('reviews')
    .update({ published })
    .eq('id', id)
    .select('id')

  if (error) {
    console.error('[admin/reviews] Supabase update error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Review not found' }, { status: 404 })
  }

  return NextResponse.json({}, { status: 200 })
}
