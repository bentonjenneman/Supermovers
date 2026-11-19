import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { failure, sameOrigin } from '@/lib/blog-http'
import { validId } from '@/lib/blog'
export const runtime = 'edge'
type Context = { params: { id: string } }
export async function PATCH(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(request) || sameOrigin(request)
  if (denied) return denied
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid comment.' }, { status: 400 })
  const value = await request.json().catch(() => null)
  if (!['pending', 'approved', 'rejected'].includes(value?.status)) return NextResponse.json({ error: 'Choose a comment status.' }, { status: 400 })
  try {
    const { data, error } = await createAdminClient().from('blog_comments').update({ status: value.status }).eq('id', params.id)
      .select('id,post_id,name,body,status,created_at').maybeSingle()
    if (error) throw error
    return data ? NextResponse.json({ comment: data }) : NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
  } catch (error) { return failure(error) }
}
export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = requireAdmin(request) || sameOrigin(request)
  if (denied) return denied
  if (!validId(params.id)) return NextResponse.json({ error: 'Invalid comment.' }, { status: 400 })
  try {
    const { error, data } = await createAdminClient().from('blog_comments').delete().eq('id', params.id).select('id').maybeSingle()
    if (error) throw error
    return data ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: 'Comment not found.' }, { status: 404 })
  } catch (error) { return failure(error) }
}
