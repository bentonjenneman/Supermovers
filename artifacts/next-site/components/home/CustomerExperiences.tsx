import Link from 'next/link'
import type { PublicReview } from '@/lib/google-reviews/public'
import ReviewReveal from './ReviewReveal'

type Props = { reviews: PublicReview[] | null }

const button =
  'inline-flex min-h-[48px] items-center justify-center rounded-[12px] px-7 font-heading font-semibold text-[15px] md:text-base transition-colors duration-200 motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper'

// Desktop stagger: right, slightly left, slightly right. Mobile: no offsets.
const OFFSETS = ['lg:ml-auto lg:mr-0', 'lg:ml-0 lg:mr-auto', 'lg:ml-auto lg:mr-6']

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${filled ? 'text-brand-red' : 'text-paper/20'}`} fill="currentColor" aria-hidden="true">
      <path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8L10 1.6z" />
    </svg>
  )
}

function Stars({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)))
  return (
    <div role="img" aria-label={`Rated ${r} out of 5 stars`} className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} filled={i < r} />
      ))}
    </div>
  )
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

function Notice({ title, body, testId }: { title: string; body: string; testId: string }) {
  return (
    <div data-testid={testId} role="status" className="rounded-2xl border border-dashed border-[#3a3a3a] bg-ink/60 p-8 text-center lg:text-left">
      <p className="font-heading font-semibold text-paper text-xl">{title}</p>
      <p className="mt-2 font-body text-paper/70 leading-relaxed">{body}</p>
    </div>
  )
}

export default function CustomerExperiences({ reviews }: Props) {
  const seen = new Set<string>()
  const list = (reviews ?? []).filter((r) => {
    if (!r || seen.has(r.id)) return false
    seen.add(r.id)
    return true
  }).slice(0, 3)

  return (
    <section aria-labelledby="customer-experiences" className="relative bg-ink px-5 md:px-12 py-[88px] overflow-hidden">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start text-center lg:text-left">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.18em] text-paper/60">In their words</p>
          <h2 id="customer-experiences" className="mt-3 font-heading font-bold text-paper text-[34px] md:text-[44px] leading-[1.1]">
            Real Experiences From Real Customers
          </h2>
          <div className="mx-auto lg:mx-0 mt-5 h-[5px] w-[72px] rounded-full bg-brand-red" aria-hidden="true" />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/quote" data-testid="link-start-supermove" className={`${button} bg-brand-red text-white hover:bg-[#770000]`}>
              Start My SuperMove
            </Link>
            <Link href="/reviews" data-testid="link-see-reviews" className={`${button} border-2 border-paper/70 text-paper hover:bg-paper hover:text-ink`}>
              See Reviews
            </Link>
          </div>
        </div>

        <div>
          {reviews === null ? (
            <Notice testId="status-reviews-error" title="Reviews couldn't load right now" body="We had trouble loading customer reviews. Please refresh the page or visit our reviews page to read them." />
          ) : list.length === 0 ? (
            <Notice testId="status-reviews-empty" title="No reviews to show yet" body="Customer reviews will appear here as soon as they're available." />
          ) : (
            <ul className="flex flex-col gap-6">
              {list.map((r, i) => (
                <ReviewReveal
                  key={r.id}
                  testId={`card-review-${r.id}`}
                  className={`w-full lg:w-[calc(100%-64px)] lg:max-w-[560px] ${OFFSETS[i]}`}
                >
                  <div className="group relative rounded-2xl border border-[#262626] bg-surface p-6 md:p-7 shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-[border-color,transform] duration-300 hover:border-[#3a3a3a] motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none">
                  <span className="absolute left-0 top-6 bottom-6 w-[3px] rounded-r-full bg-brand-red" aria-hidden="true" />
                  <figure>
                    <div className="flex items-center justify-between gap-4">
                      <Stars rating={r.rating} />
                      {r.dateLabel && <span className="font-body text-xs text-paper/55">{r.dateLabel}</span>}
                    </div>
                    {r.comment && (
                      <blockquote className="mt-4 font-body text-paper/90 text-[16px] md:text-[17px] leading-relaxed whitespace-pre-line break-words">
                        {r.comment}
                      </blockquote>
                    )}
                    <figcaption className="mt-5 flex items-center gap-3">
                      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-red/15 font-heading text-sm font-semibold text-paper">
                        {initials(r.name)}
                      </span>
                      <span className="font-heading font-semibold text-paper break-words">{r.name}</span>
                    </figcaption>
                  </figure>
                  </div>
                </ReviewReveal>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
