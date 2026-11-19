import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { validId, validatePost } from '@/lib/blog'
import { POST_FIELDS } from '@/lib/blog-server'
import { sameOrigin, failure } from '@/lib/blog-http'
export const runtime = 'edge'
export const dynamic = 'force-dynamic'
type Context = { params: { id: string } }

export async function GET(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(request)
  if (denied) return denied
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid post.' }, { status: 400 })
  try {
    const { data, error } = await createAdminClient().from('blog_posts').select(POST_FIELDS).eq('id', params.id).maybeSingle()
    if (error) throw error
    return data ? NextResponse.json({ post: data }, { headers: { 'Cache-Control': 'no-store' } })
      : NextResponse.json({ error: 'Post not found.' }, { status: 404 })
  } catch (error) { return failure(error) }
}
export async function PUT(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(request) || sameOrigin(request)
  if (denied) return denied
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid post.' }, { status: 400 })
  const body = await request.json().catch(() => null)
  const valid = validatePost(body)
  if ('error' in valid) return NextResponse.json(valid, { status: 400 })
  if (!body?.updated_at || !Number.isFinite(Date.parse(body.updated_at))) return NextResponse.json({ error: 'Reload this post before saving.' }, { status: 400 })
  try {
    const { data, error } = await createAdminClient().from('blog_posts').update(valid.data)
      .eq('id', params.id).eq('updated_at', body.updated_at).select(POST_FIELDS).maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'This post changed or was deleted in another session. Reload it before saving to avoid overwriting changes.' }, { status: 409 })
    return NextResponse.json({ post: data })
  } catch (error) { return failure(error) }
}
export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(request) || sameOrigin(request)
  if (denied) return denied
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid post.' }, { status: 400 })
  const body = await request.json().catch(() => null)
  if (!body?.updated_at || !Number.isFinite(Date.parse(body.updated_at))) return NextResponse.json({ error: 'Reload this post before deleting.' }, { status: 400 })
  try {
    const { data, error } = await createAdminClient().from('blog_posts').delete()
      .eq('id', params.id).eq('updated_at', body.updated_at).select('id').maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'This post changed or was deleted. Reload before deleting.' }, { status: 409 })
    return NextResponse.json({ deleted: true })
  } catch (error) { return failure(error) }
}
