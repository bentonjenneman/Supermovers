import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET

  if (!adminPassword || !adminSessionSecret) {
    return NextResponse.json(
      { error: 'Server misconfiguration: missing required env vars' },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).password !== 'string'
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid password field' },
      { status: 400 },
    )
  }

  const { password } = body as { password: string }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true }, { status: 200 })
  response.cookies.set('admin_session', adminSessionSecret, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  return response
}
