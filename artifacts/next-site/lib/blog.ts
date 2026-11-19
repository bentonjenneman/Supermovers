export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  kind: 'text' | 'video'
  image_url: string
  youtube_url: string
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
  like_count: number
  comment_count: number
}

export type BlogComment = {
  id: string
  post_id: string
  name: string
  body: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type BlogInput = Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'content' | 'kind' | 'image_url' | 'youtube_url' | 'status'>
export type BlogSort = 'recent' | 'oldest' | 'popular'
export const BLOG_PAGE_SIZE = 12
export const EMPTY_POST: BlogInput = {
  title: '', slug: '', excerpt: '', content: '', kind: 'text',
  image_url: '', youtube_url: '', status: 'draft',
}
export function youtubeId(value: string): string | null {
  try {
    const u = new URL(value)
    if (u.protocol !== 'https:' || u.username || u.password || u.port) return null
    let id = ''
    if (u.hostname === 'youtu.be') id = u.pathname.slice(1)
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(u.hostname)) {
      if (u.pathname === '/watch') id = u.searchParams.get('v') ?? ''
      else if (/^\/(shorts|embed)\/[^/]+\/?$/.test(u.pathname)) id = u.pathname.split('/')[2]
    }
    return /^[\w-]{11}$/.test(id) ? id : null
  } catch { return null }
}
export function postImage(post: Pick<BlogPost, 'image_url' | 'youtube_url' | 'kind'>): string {
  if (post.image_url) return post.image_url
  const id = youtubeId(post.youtube_url)
  return post.kind === 'video' && id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''
}
export function safeImage(value: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password && !/[\s\\]/.test(value)
  } catch { return /^\/(?!\/)[\w/%.()-]+$/.test(value) }
}
export function validatePost(value: unknown): { data: BlogInput } | { error: string } {
  if (!value || typeof value !== 'object') return { error: 'Enter the post details.' }
  const v = value as Record<string, unknown>
  const limits = { title: 180, slug: 180, excerpt: 500, content: 50000, image_url: 2048, youtube_url: 2048 }
  const text: Record<string, string> = {}
  for (const [key, max] of Object.entries(limits)) {
    if (typeof v[key] !== 'string' || (v[key] as string).length > max) return { error: `${key.replace('_', ' ')} must be text of at most ${max} characters.` }
    text[key] = (v[key] as string).trim()
  }
  if (!text.title) return { error: 'A title is required.' }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(text.slug)) return { error: 'Use a URL slug with lowercase letters, numbers, and single hyphens.' }
  if (!['text', 'video'].includes(String(v.kind)) || !['draft', 'published'].includes(String(v.status))) return { error: 'Choose a valid post type and publication status.' }
  if (!safeImage(text.image_url)) return { error: 'Use an HTTPS image URL or upload a cover image.' }
  if (text.youtube_url && !youtubeId(text.youtube_url)) return { error: 'Enter a valid HTTPS YouTube video link.' }
  if (v.status === 'published') {
    if (!text.excerpt) return { error: 'Add a short preview before publishing.' }
    if (v.kind === 'text' && (!text.content || !text.image_url)) return { error: 'Text posts need a cover image and article text before publishing.' }
    if (v.kind === 'video' && !youtubeId(text.youtube_url)) return { error: 'Video posts need a YouTube video link before publishing.' }
  }
  return { data: { ...text, kind: v.kind, status: v.status } as BlogInput }
}
export function validateComment(value: unknown): { data: { name: string; body: string } } | { error: string } {
  if (!value || typeof value !== 'object') return { error: 'Enter your name and comment.' }
  const v = value as Record<string, unknown>
  if (typeof v.name !== 'string' || typeof v.body !== 'string') return { error: 'Enter your name and comment.' }
  const name = v.name.trim(), body = v.body.trim()
  if (!name || name.length > 80 || !body || body.length > 3000) return { error: 'Use a name of 1–80 characters and a comment of 1–3,000 characters.' }
  return { data: { name, body } }
}
export const validId = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
