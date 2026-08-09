import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).pathname !== 'string'
  ) {
    return NextResponse.json(
      { error: 'pathname is required and must be a string' },
      { status: 400 },
    )
  }

  const { pathname, referrer } = body as { pathname: string; referrer?: string }

  // Cloudflare geo — unavailable outside the Edge; safe to ignore
  let approxCity: string | null = null
  let approxRegion: string | null = null
  try {
    const cf = getRequestContext().cf
    approxCity = typeof cf?.city === 'string' ? cf.city : null
    approxRegion = typeof cf?.region === 'string' ? cf.region : null
  } catch {
    // Running locally via `next dev` — no Cloudflare context
  }

  // Read User-Agent from headers (never trust client-supplied values)
  const userAgent = request.headers.get('user-agent')

  // Existing session cookie (httpOnly — set by this route, not JS)
  const existingSessionId = request.cookies.get('site_session')?.value ?? null

  let supabase: ReturnType<typeof createAdminClient>
  try {
    supabase = createAdminClient()
  } catch (err) {
    console.error('[session] Admin client init failed:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  try {
    let sessionId: string

    if (existingSessionId) {
      // Check whether the cookie maps to a real session row
      const { data: existingSession, error: lookupError } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', existingSessionId)
        .maybeSingle()

      if (!lookupError && existingSession) {
        // Valid session — refresh last_seen_at and log the pageview
        await supabase
          .from('sessions')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', existingSessionId)

        const { error: pvError } = await supabase
          .from('pageviews')
          .insert({ session_id: existingSessionId, page_path: pathname })

        if (pvError) {
          console.error('[session] Failed to insert pageview:', pvError)
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        }

        sessionId = existingSessionId
      } else {
        // Cookie present but session row missing — create a fresh session
        sessionId = await createNewSession(supabase, pathname, referrer, userAgent, approxCity, approxRegion)
      }
    } else {
      // No cookie — create a new session (landing pageview included)
      sessionId = await createNewSession(supabase, pathname, referrer, userAgent, approxCity, approxRegion)
    }

    const response = NextResponse.json({}, { status: 200 })
    response.cookies.set('site_session', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 30, // 30 minutes, rolling
    })
    return response
  } catch (err) {
    console.error('[session] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function createNewSession(
  supabase: ReturnType<typeof createAdminClient>,
  pathname: string,
  referrer: string | undefined,
  userAgent: string | null,
  approxCity: string | null,
  approxRegion: string | null,
): Promise<string> {
  const { data: newSession, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      landing_page: pathname,
      referrer: referrer ?? null,
      user_agent: userAgent,
      approx_city: approxCity,
      approx_region: approxRegion,
    })
    .select('id')
    .single()

  if (sessionError || !newSession) {
    console.error('[session] Failed to create session:', sessionError)
    throw new Error('Failed to create session')
  }

  // Landing pageview — one row, not two
  const { error: pvError } = await supabase
    .from('pageviews')
    .insert({ session_id: newSession.id, page_path: pathname })

  if (pvError) {
    console.error('[session] Failed to insert landing pageview:', pvError)
    throw new Error('Failed to insert pageview')
  }

  return newSession.id as string
}
