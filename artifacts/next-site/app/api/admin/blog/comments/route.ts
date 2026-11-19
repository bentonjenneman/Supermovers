import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { failure } from '@/lib/blog-http'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request)
  if (denied) return denied
  const status = request.nextUrl.searchParams.get('status') || 'pending'
  if (!['pending', 'approved', 'rejected', 'all'].includes(status)) return NextResponse.json({ error: 'Invalid comment filter.' }, { status: 400 })
  const page = Math.max(1, Math.min(100000, Number(request.nextUrl.searchParams.get('page')) || 1))
  try {
    let query = createAdminClient().from('blog_comments').select('id,post_id,name,body,status,created_at,blog_posts(title,slug)', { count: 'exact' })
    if (status !== 'all') query = query.eq('status', status)
    const { data, error, count } = await query.order('created_at', { ascending: false }).order('id').range((page - 1) * 20, page * 20 - 1)
    if (error) throw error
    return NextResponse.json({ comments: data, total: count ?? 0 }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) { return failure(error) }
}
