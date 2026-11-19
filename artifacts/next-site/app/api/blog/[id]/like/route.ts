import { NextRequest, NextResponse } from 'next/server'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { actor, failure, sameOrigin, visitor, withVisitor } from '@/lib/blog-http'
import { validId } from '@/lib/blog'
export const runtime = 'edge'
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = sameOrigin(request)
  if (denied) return denied
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid post.' }, { status: 400 })
  const body = await request.json().catch(() => null)
  if (typeof body?.liked !== 'boolean') return NextResponse.json({ error: 'Choose like or unlike.' }, { status: 400 })
  try {
    const who = await visitor(request)
    const { data, error } = await createAdminClient().rpc('blog_set_like', {
      p_post: params.id, p_visitor: who.id, p_liked: body.liked, p_actor: await actor(request, who.id),
    })
    if (error) throw error
    if (data.error) return withVisitor(NextResponse.json({ error: data.error === 'rate_limit' ? 'Too many requests. Try again in a minute.' : 'Post not found.' }, { status: data.error === 'rate_limit' ? 429 : 404 }), who.cookie)
    return withVisitor(NextResponse.json(data), who.cookie)
  } catch (error) { return failure(error) }
}
