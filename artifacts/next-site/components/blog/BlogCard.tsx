import Link from 'next/link'
import { postImage, type BlogPost } from '@/lib/blog'
import { fmtDate } from './format'

export default function BlogCard({ post }: { post: BlogPost }) {
  const img = postImage(post)
  return (
    <Link href={`/blog/${post.slug}`} data-testid={`card-post-${post.id}`}
      className="group relative flex h-[420px] w-full max-w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 motion-safe:hover:-translate-y-1 hover:border-brand-red/70 hover:shadow-2xl hover:shadow-black/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-red">
      <div className="relative h-44 shrink-0 overflow-hidden bg-ink">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 motion-safe:group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-blue font-heading text-2xl font-extrabold text-white/30">SuperMovers</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 font-heading text-[11px] font-bold uppercase tracking-widest text-paper backdrop-blur">
          {post.kind === 'video' ? 'Video' : 'Story'}
        </span>
        {post.kind === 'video' && (
          <span aria-hidden="true" className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-red/90 shadow-xl transition motion-safe:group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6 fill-white"><path d="M8 5v14l11-7z" /></svg>
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-5">
        <time className="font-body text-xs font-semibold uppercase tracking-widest text-ink-muted">{fmtDate(post.published_at)}</time>
        <h2 className="mt-2 line-clamp-2 h-12 shrink-0 break-words font-heading text-lg font-extrabold leading-6 text-paper transition-colors group-hover:text-white">{post.title}</h2>
        <p className="mt-3 line-clamp-3 break-words font-body text-sm leading-5 text-ink-muted">{post.excerpt}</p>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="inline-flex items-center gap-1.5 font-body text-sm text-ink-muted" data-testid={`text-likes-${post.id}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-brand-red"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.1 4.3 2.4.7-1.3 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" /></svg>
            {post.like_count} {post.like_count === 1 ? 'like' : 'likes'}
          </span>
          <span className="font-heading text-sm font-bold text-brand-red transition motion-safe:group-hover:translate-x-1">Read {'->'}</span>
        </div>
      </div>
    </Link>
  )
}
