import { NextRequest, NextResponse } from 'next/server'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { actor, failure, sameOrigin, visitor, withVisitor } from '@/lib/blog-http'
import { validId, validateComment } from '@/lib/blog'
export const runtime = 'edge'
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = sameOrigin(request)
  if (denied) return denied
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid post.' }, { status: 400 })
  const body = await request.json().catch(() => null)
  // Quietly reject honeypot submissions without inserting or exposing a bypass.
  if (body?.website) return NextResponse.json({ error: 'Could not submit this comment.' }, { status: 400 })
  const valid = validateComment(body)
  if ('error' in valid) return NextResponse.json(valid, { status: 400 })
  try {
    const who = await visitor(request)
    const { data, error } = await createAdminClient().rpc('blog_submit_comment', {
      p_post: params.id, p_visitor: who.id, p_name: valid.data.name, p_body: valid.data.body,
      p_actor: await actor(request, who.id),
    })
    if (error) throw error
    if (data.error) return withVisitor(NextResponse.json({ error: data.error === 'rate_limit' ? 'Please wait 10 minutes before posting more comments.' : 'Post not found.' }, { status: data.error === 'rate_limit' ? 429 : 404 }), who.cookie)
    return withVisitor(NextResponse.json(data, { status: 201 }), who.cookie)
  } catch (error) { return failure(error) }
}
