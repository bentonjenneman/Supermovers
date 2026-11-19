import { unstable_noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { BLOG_PAGE_SIZE, type BlogPost, type BlogSort, type BlogComment } from '@/lib/blog'

export const POST_FIELDS = 'id,slug,title,excerpt,content,kind,image_url,youtube_url,status,published_at,created_at,updated_at,like_count,comment_count'
export const CARD_FIELDS = POST_FIELDS.replace(',content', '')
export function createBlogClient() {
  unstable_noStore()
  // Explicit fetch policy also covers Route Handlers, where Next's Data Cache
  // can otherwise retain different moderation-filter query results.
  return createAdminClient({ noStore: true })
}
export function blogError(error: { code?: string } | unknown): string {
  const code = (error as { code?: string })?.code
  return ['42P01', 'PGRST205', 'PGRST202', '42703', 'PGRST204'].includes(code ?? '')
    ? 'Blog setup is not complete. Run supabase/blog.sql in your Supabase SQL Editor, then refresh.'
    : 'The blog could not be loaded. Please try again.'
}
export async function listPosts(sort: BlogSort = 'recent', page = 1) {
  unstable_noStore()
  try {
    let query = createBlogClient().from('blog_posts').select(CARD_FIELDS, { count: 'exact' }).eq('status', 'published')
    if (sort === 'popular') query = query.order('like_count', { ascending: false })
    query = query.order('published_at', { ascending: sort === 'oldest' }).order('id')
    const { data, count, error } = await query.range((page - 1) * BLOG_PAGE_SIZE, page * BLOG_PAGE_SIZE - 1)
    if (error) throw error
    return { posts: data as unknown as BlogPost[], total: count ?? 0, error: null }
  } catch (error) {
    console.error('[blog list]', error)
    return { posts: [] as BlogPost[], total: 0, error: blogError(error) }
  }
}
export async function findPost(slug: string, admin = false) {
  unstable_noStore()
  let query = createBlogClient().from('blog_posts').select(POST_FIELDS).eq('slug', slug)
  if (!admin) query = query.eq('status', 'published')
  const { data, error } = await query.maybeSingle()
  if (error) throw error
  return data as BlogPost | null
}
export async function approvedComments(postId: string, page = 1) {
  unstable_noStore()
  const { data, error, count } = await createBlogClient().from('blog_comments')
    .select('id,post_id,name,body,status,created_at', { count: 'exact' })
    .eq('post_id', postId).eq('status', 'approved').order('created_at', { ascending: false }).order('id')
    .range((page - 1) * 20, page * 20 - 1)
  if (error) throw error
  return { comments: data as BlogComment[], total: count ?? 0 }
}
