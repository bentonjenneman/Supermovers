import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'closed'] as const

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

  const { status } = body as Record<string, unknown>

  if (!status || !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
    return NextResponse.json(
      {
        error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
      },
      { status: 400 },
    )
  }

  const { id } = params

  let supabase: ReturnType<typeof createAdminClient>
  try {
    supabase = createAdminClient()
  } catch (err) {
    console.error('[admin/quotes] Admin client init failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  const { data, error } = await supabase
    .from('quotes')
    .update({ status })
    .eq('id', id)
    .select('id')

  if (error) {
    console.error('[admin/quotes] Supabase update error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
  }

  return NextResponse.json({}, { status: 200 })
}
