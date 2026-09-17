import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const b = body as Record<string, unknown>

  // Validate name
  if (!b.name || typeof b.name !== 'string' || !b.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Validate review_text
  if (!b.review_text || typeof b.review_text !== 'string' || !b.review_text.trim()) {
    return NextResponse.json({ error: 'Review text is required' }, { status: 400 })
  }

  // Validate rating — must be an integer 1–5
  const rating = Number(b.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: 'Rating must be an integer between 1 and 5' },
      { status: 400 },
    )
  }

  // Honeypot — silently succeed without inserting anything
  if (b._hp && typeof b._hp === 'string' && (b._hp as string).trim() !== '') {
    return NextResponse.json({}, { status: 200 })
  }

  // Optional session linkage
  const sessionId = request.cookies.get('site_session')?.value ?? null

  let supabase: ReturnType<typeof createAdminClient>
  try {
    supabase = createAdminClient()
  } catch (err) {
    console.error('[review] Admin client init failed:', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  const { error: insertError } = await supabase.from('reviews').insert({
    session_id: sessionId,
    name: (b.name as string).trim(),
    rating,
    review_text: (b.review_text as string).trim(),
    published: false, // always — never let client input reach this column
  })

  if (insertError) {
    console.error('[review] Supabase insert error:', insertError)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({}, { status: 200 })
}
