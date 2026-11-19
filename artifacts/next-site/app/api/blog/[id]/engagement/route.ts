import { NextRequest, NextResponse } from 'next/server'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { approvedComments } from '@/lib/blog-server'
import { failure, visitor, withVisitor } from '@/lib/blog-http'
import { validId } from '@/lib/blog'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid post.' }, { status: 400 })
  try {
    const client = createAdminClient()
    const { data: post, error } = await client.from('blog_posts').select('like_count,comment_count').eq('id', params.id).eq('status', 'published').maybeSingle()
    if (error) throw error
    if (!post) return NextResponse.json({ error: 'Post not found.' }, { status: 404 })
    const who = await visitor(request)
    const page = Math.max(1, Math.min(100000, Math.floor(Number(request.nextUrl.searchParams.get('page')) || 1)))
    const [liked, comments] = await Promise.all([
      client.from('blog_likes').select('post_id').eq('post_id', params.id).eq('visitor_id', who.id).maybeSingle(),
      approvedComments(params.id, page),
    ])
    if (liked.error) throw liked.error
    return withVisitor(NextResponse.json({ ...post, liked: !!liked.data, ...comments }), who.cookie)
  } catch (error) { return failure(error) }
}
