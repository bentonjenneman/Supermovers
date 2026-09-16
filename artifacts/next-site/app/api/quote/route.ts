import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendQuoteAlerts } from '@/lib/twilio/send-quote-alert'

function isValidEmail(email: string) {
  const at = email.indexOf('@')
  if (at < 1) return false
  const dot = email.indexOf('.', at)
  return dot > at + 1
}

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

  // Server-side validation
  if (!b.name || typeof b.name !== 'string' || !b.name.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  if (!b.email || typeof b.email !== 'string' || !b.email.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }
  if (!isValidEmail(b.email.trim())) {
    return NextResponse.json(
      { error: 'A valid email address is required' },
      { status: 400 },
    )
  }
  if (!b.phone || typeof b.phone !== 'string' || !b.phone.trim()) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  // Honeypot — silently succeed without inserting anything
  if (b._hp && typeof b._hp === 'string' && (b._hp as string).trim() !== '') {
    return NextResponse.json({}, { status: 200 })
  }

  // Optional session linkage — no FK validation; Postgres handles it
  const sessionId = request.cookies.get('site_session')?.value ?? null

  let supabase: ReturnType<typeof createAdminClient>
  try {
    supabase = createAdminClient()
  } catch (err) {
    console.error('[quote] Admin client init failed:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }

  const quote = {
    session_id: sessionId,
    name: b.name.trim(),
    email: b.email.trim(),
    phone: (b.phone as string).trim(),
    move_date: typeof b.move_date === 'string' && b.move_date ? b.move_date : null,
    origin_address: typeof b.origin_address === 'string' && b.origin_address.trim() ? b.origin_address.trim() : null,
    destination_address: typeof b.destination_address === 'string' && b.destination_address.trim() ? b.destination_address.trim() : null,
    move_size: typeof b.move_size === 'string' && b.move_size.trim() ? b.move_size.trim() : null,
    notes: typeof b.notes === 'string' && b.notes.trim() ? b.notes.trim() : null,
    // status defaults to 'new' via the column default — not set here
  }

  const { error: insertError } = await supabase.from('quotes').insert(quote)

  if (insertError) {
    console.error('[quote] Supabase insert error:', insertError)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  await sendQuoteAlerts({
    name: quote.name,
    email: quote.email,
    phone: quote.phone,
    moveDate: quote.move_date,
    originAddress: quote.origin_address,
    destinationAddress: quote.destination_address,
    moveSize: quote.move_size,
  }).catch((error) => {
    console.error('[quote-sms] Unexpected alert failure:', error)
  })

  return NextResponse.json({}, { status: 200 })
}
