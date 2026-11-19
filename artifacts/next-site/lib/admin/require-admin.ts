import { NextRequest, NextResponse } from 'next/server'

export function isValidAdminCookie(value: string | null | undefined): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || !value || secret.length !== value.length) return false
  let difference = 0
  for (let i = 0; i < secret.length; i++) {
    difference |= secret.charCodeAt(i) ^ value.charCodeAt(i)
  }
  return difference === 0
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  if (!isValidAdminCookie(request.cookies.get('admin_session')?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
