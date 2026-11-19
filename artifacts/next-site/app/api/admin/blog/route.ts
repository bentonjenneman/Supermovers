import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { validatePost } from '@/lib/blog'
import { POST_FIELDS } from '@/lib/blog-server'
import { sameOrigin, failure } from '@/lib/blog-http'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  try {
    const page = Math.max(1, Math.min(100000, Number(request.nextUrl.searchParams.get('page')) || 1))
    const { data, count, error } = await createAdminClient().from('blog_posts')
      .select(POST_FIELDS, { count: 'exact' }).order('created_at', { ascending: false }).order('id')
      .range((page - 1) * 20, page * 20 - 1)
    if (error) throw error
    return NextResponse.json({ posts: data, total: count ?? 0 }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return failure(error) }
}
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request) || sameOrigin(request)
  if (denied) return denied
  const value = await request.json().catch(() => null)
  const valid = validatePost(value)
  if ('error' in valid) return NextResponse.json(valid, { status: 400 })
  try {
    const { data, error } = await createAdminClient().from('blog_posts').insert(valid.data).select(POST_FIELDS).single()
    if (error) throw error
    return NextResponse.json({ post: data }, { status: 201 })
  } catch (error) { return failure(error) }
}
