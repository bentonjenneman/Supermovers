import { NextRequest, NextResponse } from 'next/server'
import { listPosts } from '@/lib/blog-server'
import type { BlogSort } from '@/lib/blog'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const sort = request.nextUrl.searchParams.get('sort') || 'recent'
  if (!['recent', 'oldest', 'popular'].includes(sort)) return NextResponse.json({ error: 'Invalid sort.' }, { status: 400 })
  const page = Math.max(1, Math.min(100000, Math.floor(Number(request.nextUrl.searchParams.get('page')) || 1)))
  const result = await listPosts(sort as BlogSort, page)
  return NextResponse.json(result.error ? { error: result.error } : { posts: result.posts, total: result.total },
    { status: result.error ? 503 : 200, headers: { 'Cache-Control': 'no-store' } })
}
