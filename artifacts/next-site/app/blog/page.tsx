import type { Metadata } from 'next'
import Link from 'next/link'
import { listPosts } from '@/lib/blog-server'
import { BLOG_PAGE_SIZE, type BlogSort } from '@/lib/blog'
import BlogCard from '@/components/blog/BlogCard'
import { SortTabs, Pager } from '@/components/blog/BlogControls'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog | SuperMovers',
  description: 'Stories, tips, and videos from the SuperMovers crew in Athens, GA.',
}

export default async function Blog({ searchParams }: { searchParams: { sort?: string; page?: string } }) {
  const sort: BlogSort = (['recent', 'oldest', 'popular'] as const).find(s => s === searchParams.sort) ?? 'recent'
  const page = Math.max(1, Math.floor(Number(searchParams.page)) || 1)
  const { posts, total, error } = await listPosts(sort, page)
  const pages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE))
  return (
    <main className="min-h-[60vh] bg-ink">
      <section className="relative overflow-hidden bg-brand-blue px-4 pb-24 pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-red/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="font-heading text-sm font-bold uppercase tracking-[0.3em] text-white/70">From the crew</p>
          <h1 className="mx-auto mt-3 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-2 text-center font-heading text-3xl font-extrabold leading-[1.05] text-white md:gap-x-4 md:text-6xl">
            <span>The</span>{' '}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/supermovers-wordmark.png"
              alt="SuperMovers"
              width={626}
              height={162}
              className="h-auto w-[min(52vw,240px)] object-contain md:w-[360px]"
            />{' '}
            <span>Blog</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl font-body text-lg text-white/80">Moving tips, behind-the-scenes stories, and the occasional video from the guys carrying your couch across Athens.</p>
          <div className="mx-auto mt-6 h-[5px] w-[72px] rounded-full bg-brand-red" aria-hidden="true" />
        </div>
      </section>
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-4 pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <SortTabs sort={sort} />
          {!error && total > 0 && <p className="font-body text-sm text-ink-muted" data-testid="text-total">{total} {total === 1 ? 'post' : 'posts'}</p>}
        </div>
        {error ? (
          <div role="alert" className="rounded-2xl border border-brand-red/50 bg-surface p-10 text-center">
            <h2 className="font-heading text-2xl font-extrabold text-paper">Blog unavailable</h2>
            <p className="mx-auto mt-3 max-w-lg font-body text-ink-muted">{error}</p>
            <Link href="/blog" className="mt-6 inline-block rounded-md bg-brand-red px-5 py-3 font-heading text-sm font-bold text-paper hover:bg-[#770000]">Try again</Link>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/60 p-12 text-center">
            <h2 className="font-heading text-2xl font-extrabold text-paper">{page > 1 ? 'Nothing on this page' : 'The first post is on its way'}</h2>
            <p className="mx-auto mt-3 max-w-md font-body text-ink-muted">{page > 1 ? 'You went past the last page of posts.' : 'The crew is busy moving people right now. Check back soon for stories and tips.'}</p>
            <Link href={page > 1 ? '/blog' : '/quote'} className="mt-6 inline-block rounded-md bg-brand-red px-5 py-3 font-heading text-sm font-bold text-paper hover:bg-[#770000]">{page > 1 ? 'Back to page 1' : 'Get a free quote'}</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {posts.map(p => <BlogCard key={p.id} post={p} />)}
          </div>
        )}
        <Pager sort={sort} page={page} pages={pages} />
      </section>
    </main>
  )
}
