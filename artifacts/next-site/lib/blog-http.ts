import { NextRequest, NextResponse } from 'next/server'
import { getServerEnv } from '@/lib/env'
import { blogError } from '@/lib/blog-server'
import { validId } from '@/lib/blog'

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  const site = request.headers.get('sec-fetch-site')
  if (site === 'cross-site') return NextResponse.json({ error: 'Cross-site requests are not allowed.' }, { status: 403 })
  if (origin) {
    try {
      const host = new URL(origin).host
      if (![request.nextUrl.host, request.headers.get('host'), request.headers.get('x-forwarded-host')].includes(host)) {
        return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
      }
    } catch { return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 }) }
  }
  return null
}
export function failure(error: unknown) {
  console.error('[blog API]', error)
  const code = (error as { code?: string })?.code
  if (code === '23505') return NextResponse.json({ error: 'That URL slug is already in use. Choose another.' }, { status: 409 })
  const message = blogError(error)
  return NextResponse.json({ error: message }, { status: message.includes('setup') ? 503 : 500 })
}
async function signature(value: string) {
  const secret = getServerEnv('ADMIN_SESSION_SECRET') || getServerEnv('SESSION_SECRET')
  if (!secret) throw new Error('Blog visitor signing is not configured.')
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return Array.from(new Uint8Array(bytes), n => n.toString(16).padStart(2, '0')).join('')
}
export async function visitor(request: NextRequest) {
  const raw = request.cookies.get('blog_visitor')?.value ?? ''
  const [id, sig] = raw.split('.')
  if (validId(id ?? '') && sig === await signature(id)) return { id, cookie: null }
  const newId = crypto.randomUUID()
  return { id: newId, cookie: `${newId}.${await signature(newId)}` }
}
export function withVisitor(response: NextResponse, cookie: string | null) {
  if (cookie) response.cookies.set('blog_visitor', cookie, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 31536000,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
export async function actor(request: NextRequest, id: string) {
  // Store a keyed hash, never a raw visitor IP.
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return signature(`blog-rate:${ip || id}`)
}
