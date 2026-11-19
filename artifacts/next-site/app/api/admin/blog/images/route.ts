import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/require-admin'
import { createBlogClient as createAdminClient } from '@/lib/blog-server'
import { sameOrigin, failure } from '@/lib/blog-http'
export const runtime = 'edge'
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request) || sameOrigin(request)
  if (denied) return denied
  const body = await request.json().catch(() => null)
  if (!body || !TYPES[body.type] || !Number.isInteger(body.size) || body.size < 1 || body.size > 5242880) {
    return NextResponse.json({ error: 'Choose a JPEG, PNG, or WebP image under 5 MB.' }, { status: 400 })
  }
  try {
    const client = createAdminClient()
    const path = `${crypto.randomUUID()}.${TYPES[body.type]}`
    const { data, error } = await client.storage.from('blog-images').createSignedUploadUrl(path, { upsert: false })
    if (error) return NextResponse.json({ error: 'Could not prepare the image upload. Check that the blog-images bucket from the Blog SQL is set up.' }, { status: 503 })
    return NextResponse.json({ signedUrl: data.signedUrl, publicUrl: client.storage.from('blog-images').getPublicUrl(path).data.publicUrl })
  } catch (error) { return failure(error) }
}
