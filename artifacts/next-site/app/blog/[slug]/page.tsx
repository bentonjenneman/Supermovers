import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findPost } from '@/lib/blog-server'
import { postImage, youtubeId, type BlogPost } from '@/lib/blog'
import { fmtDate, paragraphs } from '@/components/blog/format'
import Engagement from '@/components/blog/Engagement'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

async function load(slug: string): Promise<{ post: BlogPost | null; failed: boolean }> {
  try { return { post: await findPost(slug), failed: false } }
  catch (e) { console.error('[blog detail]', e); return { post: null, failed: true } }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { post } = await load(params.slug)
  if (!post) return { title: 'Blog | SuperMovers' }
  const img = postImage(post)
  return { title: `${post.title} | SuperMovers Blog`, description: post.excerpt, openGraph: { title: post.title, description: post.excerpt, images: img ? [img] : undefined } }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { post, failed } = await load(params.slug)
  if (failed) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-ink px-4 py-24">
        <div role="alert" className="max-w-lg rounded-2xl border border-brand-red/50 bg-surface p-10 text-center">
          <h1 className="font-heading text-2xl font-extrabold text-paper">This post is temporarily unavailable</h1>
          <p className="mt-3 font-body text-ink-muted">We could not reach the blog right now. Please refresh in a moment.</p>
          <Link href={`/blog/${params.slug}`} className="mt-6 inline-block rounded-md bg-brand-red px-5 py-3 font-heading text-sm font-bold text-paper">Try again</Link>
        </div>
      </main>
    )
  }
  if (!post) notFound()
  const img = postImage(post)
  const vid = post.kind === 'video' ? youtubeId(post.youtube_url) : null
  return (
    <main className="min-h-screen bg-ink">
      <header className="relative overflow-hidden bg-brand-blue px-4 pb-32 pt-16">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-brand-red/20 blur-3xl" />
        <div className="relative mx-auto max-w-3xl">
          <Link href="/blog" className="font-heading text-sm font-bold text-white/70 transition-colors hover:text-white" data-testid="link-back">{'<-'} All posts</Link>
          <p className="mt-8 font-body text-xs font-semibold uppercase tracking-[0.25em] text-white/70">{post.kind === 'video' ? 'Video' : 'Story'} / {fmtDate(post.published_at)}</p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.08] text-white md:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-5 font-body text-lg leading-relaxed text-white/85 md:text-xl">{post.excerpt}</p>}
        </div>
      </header>
      <article className="relative z-10 mx-auto -mt-20 max-w-4xl px-4 pb-16">
        {vid ? (
          <a href={`https://www.youtube.com/watch?v=${vid}`} target="_blank" rel="noopener noreferrer" data-testid="link-youtube"
            className="group relative block overflow-hidden rounded-2xl border border-border shadow-2xl shadow-black/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`Watch ${post.title} on YouTube`} className="aspect-video w-full object-cover transition duration-500 motion-safe:group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-ink/30 transition group-hover:bg-ink/10" />
            <span className="absolute inset-0 m-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-red shadow-2xl transition motion-safe:group-hover:scale-110">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 h-9 w-9 fill-white"><path d="M8 5v14l11-7z" /></svg>
            </span>
            <span className="absolute bottom-4 left-4 rounded-full bg-ink/85 px-4 py-2 font-heading text-sm font-bold text-paper">Watch on YouTube (opens new tab)</span>
          </a>
        ) : img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" className="aspect-[16/9] w-full rounded-2xl border border-border object-cover shadow-2xl shadow-black/50" />
        ) : null}
        {post.content && (
          <div className="mx-auto mt-12 max-w-2xl space-y-6 font-body text-lg leading-[1.8] text-paper/90" data-testid="text-content">
            {paragraphs(post.content).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
          </div>
        )}
        <div className="mx-auto mt-14 max-w-2xl">
          <Engagement postId={post.id} />
        </div>
        <div className="mx-auto mt-14 flex max-w-2xl flex-col items-start justify-between gap-4 rounded-2xl bg-brand-blue p-8 sm:flex-row sm:items-center">
          <p className="font-heading text-xl font-extrabold text-white">Need a crew that shows up on time?</p>
          <Link href="/quote" className="rounded-md bg-brand-red px-5 py-3 font-heading text-sm font-bold text-paper hover:bg-[#770000]">Get a free quote</Link>
        </div>
      </article>
    </main>
  )
}
