import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getServerEnv } from '@/lib/env'

export const runtime = 'edge'

async function sendSms(
  to: string,
  body: string,
  accountSid: string,
  authToken: string,
  from: string,
) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  const params = new URLSearchParams({ To: to, From: from, Body: body })
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Twilio API error ${res.status}: ${errorText}`)
  }
  return res.json()
}

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

  const { error: insertError } = await supabase.from('quotes').insert({
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
  })

  if (insertError) {
    console.error('[quote] Supabase insert error:', insertError)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }

  try {
    const accountSid = getServerEnv('TWILIO_ACCOUNT_SID')
    const authToken = getServerEnv('TWILIO_AUTH_TOKEN')
    const from = getServerEnv('TWILIO_PHONE_NUMBER')
    const ownerPhone1 = getServerEnv('OWNER_PHONE_1')
    const ownerPhone2 = getServerEnv('OWNER_PHONE_2')

    if (!accountSid || !authToken || !from || !ownerPhone1 || !ownerPhone2) {
      throw new Error('One or more required Twilio environment variables are missing')
    }

    const body =
      'New quote received, find it here: https://supermoversllc.com/admin/dashboard/quotes'
    const results = await Promise.allSettled([
      sendSms(ownerPhone1, body, accountSid, authToken, from),
      sendSms(ownerPhone2, body, accountSid, authToken, from),
    ])

    results.forEach((result) => {
      if (result.status === 'rejected') {
        console.error('[quote] SMS alert failed:', result.reason)
      }
    })
  } catch (error) {
    console.error('[quote] SMS alert failed:', error)
  }

  return NextResponse.json({}, { status: 200 })
}
