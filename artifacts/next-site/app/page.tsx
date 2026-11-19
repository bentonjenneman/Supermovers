import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import ServicePhoto from '@/components/home/ServicePhoto'
import CustomerExperiences from '@/components/home/CustomerExperiences'
import { getHomeBadgeSettings } from '@/lib/home-badge-settings'
import { getHomeReviews } from '@/lib/google-reviews/home'
import { getBannerSettings } from '@/lib/banner-settings'
import HomeBanner from '@/components/home/HomeBanner'
import { SERVICE_CARDS } from '@/lib/service-cards'
import GoogleReviewsBadge, { type GoogleBadgeStats } from '@/components/GoogleReviewsBadge'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const HERO_IMAGES = {
  desktop: '/photos/Supermovers_Horizontal_Hero_Image.jpg',
  mobile: '/photos/Supermovers_Mobile_Hero_Image.jpeg',
}

const CARD_ACTIONS = [
  { label: 'Learn More', href: '/services' },
  { label: 'Get a Quote', href: '/quote' },
]

const redButton =
  'inline-flex items-center justify-center min-h-[44px] bg-brand-red text-white font-heading font-semibold text-[15px] transition-colors duration-200 hover:bg-[#770000] motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper'

function SectionHeading({ id, children, underline = true }: { id: string; children: ReactNode; underline?: boolean }) {
  return (
    <div className="mb-12 text-center">
      <h2 id={id} className="font-heading font-bold text-paper text-[34px] md:text-[44px] leading-tight">
        {children}
      </h2>
      {underline && <div className="mx-auto mt-4 h-[5px] w-[72px] rounded-full bg-brand-red" aria-hidden="true" />}
    </div>
  )
}

function HomeGoogleBadge({ href, stats }: { href: string | null; stats: GoogleBadgeStats }) {
  const width = 'ml-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black md:ml-0 md:block md:h-auto md:w-[min(40%,330px)] md:rounded-lg md:bg-transparent'
  const image = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/google-g.png" alt="Google" width={110} height={112} className="h-7 w-7 object-contain md:hidden" />
      <GoogleReviewsBadge stats={stats} className="hidden h-auto w-full md:block" />
    </>
  )
  return href
    ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label="View the SuperMovers Google Business Profile" className={`${width} transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper`}>{image}</a>
    : <span className={width}>{image}</span>
}

export default async function Home() {
  const [badgeSettings, reviews, { banner }] = await Promise.all([
    getHomeBadgeSettings(),
    getHomeReviews(),
    getBannerSettings(),
  ])
  const { show_satisfaction_badge_home, show_google_badge_home, reviews_url } = badgeSettings
  const hasBadges = show_satisfaction_badge_home || show_google_badge_home

  return (
    <main className="overflow-x-hidden bg-ink">
      <HomeBanner banner={banner} />
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[clamp(460px,calc(100svh-160px),600px)] md:min-h-[clamp(460px,calc(100svh-120px),660px)]">
        <picture className="absolute inset-0 -z-20">
          <source media="(min-width: 768px)" srcSet={HERO_IMAGES.desktop} />
          {/* Native picture selects just one hero image before download. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGES.mobile}
            alt="The SuperMovers team lifting a crimson sofa overhead"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="h-full w-full object-cover object-[center_20%] md:object-[center_50%]"
          />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/15 via-ink/20 to-ink/45" aria-hidden="true" />

        <div
          className={`mx-auto flex w-full max-w-[1440px] flex-col px-5 md:px-12 pt-3 md:pt-10 pb-20 md:pb-24 ${hasBadges ? 'justify-between' : 'justify-end'}`}
        >
          {hasBadges && (
            <div className="flex items-center justify-between gap-3 md:gap-6 md:items-start">
              {show_satisfaction_badge_home ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/satisfaction-badge.svg"
                  alt="Customer satisfaction is always number 1"
                  width={1100}
                  height={190}
                  className="h-auto min-w-0 w-[min(calc(100%-68px),240px)] md:w-[min(48%,420px)]"
                />
              ) : (
                <span className="hidden md:block" />
              )}
              {show_google_badge_home && (
                <HomeGoogleBadge href={reviews_url} stats={badgeSettings} />
              )}
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-5 text-center">
            <h1 className="font-heading font-extrabold text-white text-[clamp(36px,10vw,48px)] md:text-[clamp(48px,5.6vw,80px)] leading-[1.05] tracking-[-0.025em] [text-shadow:0_3px_12px_rgba(0,0,0,0.6)]">
              Every Move Needs a Hero
            </h1>
            <div className="flex w-full max-w-sm flex-col justify-center gap-3 sm:max-w-none sm:w-auto sm:flex-row">
              <Button variant="primary" href="/quote" className="min-h-[48px] text-base md:text-lg px-8 py-2.5 md:py-3.5 shadow-xl shadow-brand-red/30 hover:scale-105 motion-reduce:hover:scale-100 transition-transform duration-300 motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper">
                Get a Free Quote
              </Button>
              <Button variant="secondary" href="tel:+14705624020" className="min-h-[48px] text-base md:text-lg px-8 py-2.5 md:py-3.5 border-2 border-white/80 text-white hover:bg-white hover:text-ink hover:border-white transition-colors duration-300 motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper">
                Call: (470) 562-4020
              </Button>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 text-white/60" aria-hidden="true">
          <svg className="h-6 w-6 motion-safe:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── WHAT WE DO ───────────────────────────────────────────────────── */}
      <section aria-labelledby="what-we-do" className="relative z-10 -mt-8 rounded-t-[2.5rem] md:rounded-t-[4rem] border-t border-brand-blue/60 bg-surface pt-20 pb-[88px] shadow-[0_-18px_45px_rgba(0,0,0,0.65)]">
        <div className="mx-auto max-w-[1440px] px-5 md:px-12">
          <SectionHeading id="what-we-do">What We Do</SectionHeading>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {SERVICE_CARDS.map((card) => (
              <li
                key={card.name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#262626] bg-surface transition-colors duration-200 hover:border-[#3a3a3a] motion-reduce:transition-none"
              >
                <ServicePhoto src={card.image} position={card.position} />
                <h3 className="flex min-h-[58px] items-center justify-center px-5 pt-5 text-center font-heading font-semibold text-paper text-[21px] leading-tight">
                  {card.name}
                </h3>
                <div className="mx-auto mt-4 h-[5px] w-[72px] rounded-full bg-ink-muted/60" aria-hidden="true" />
                <div className="mt-auto flex flex-col gap-2 p-5">
                  {CARD_ACTIONS.map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      aria-label={`${action.label}: ${card.name}`}
                      className={`${redButton} w-full rounded-[10px] px-4`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CustomerExperiences reviews={reviews} />

      {/* ── MEET SUPERMOVERS ─────────────────────────────────────────────── */}
      <section aria-labelledby="meet" className="border-y border-[#262626] bg-surface px-5 md:px-8 py-[88px]">
        <SectionHeading id="meet" underline={false}>
          <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 align-middle">
            <span>Meet</span>
            <span className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/supermovers-wordmark.png"
                alt="SuperMovers"
                width={626}
                height={162}
                className="block h-auto w-[min(52vw,240px)] object-contain md:w-[280px]"
              />
              <span className="absolute left-0 right-0 top-full mt-4 h-[5px] rounded-full bg-brand-red" aria-hidden="true" />
            </span>
          </span>
        </SectionHeading>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-10 md:gap-16">
          <Image
            src="/logo.png"
            alt="SuperMovers logo"
            width={320}
            height={320}
            className="h-[240px] w-[240px] md:h-[320px] md:w-[320px] object-contain"
          />
          <div className="max-w-[560px] text-center md:text-left">
            <p className="font-heading font-bold text-paper text-[28px] md:text-[38px] leading-[1.2]">
              Started by two UGA students who wanted to do things right.
            </p>
            <ul className="mt-6 space-y-3 pl-5 text-left font-body text-base md:text-lg leading-relaxed text-paper/85 list-disc marker:text-brand-red">
              <li>Straightforward, Honest Pricing.</li>
              <li>Punctuality and Professionalism.</li>
              <li>A Stress-Free Moving Process</li>
            </ul>
            <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
              <Link href="/about" className={`${redButton} h-[52px] rounded-[12px] px-8 text-base`}>
                Learn More
              </Link>
              <Link href="/quote" className={`${redButton} h-[52px] rounded-[12px] px-8 text-base`}>
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue to-transparent"></div>
        
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4 flex flex-col items-center">
          <h2 className="font-heading font-extrabold text-white text-3xl md:text-5xl mb-6">
            Ready to get moving?
          </h2>
          <p className="font-body text-white/80 text-lg mb-8 max-w-lg">
            Reach out today for a free, transparent quote. We&apos;re ready when you are.
          </p>
          <Button variant="primary" href="/quote" className="text-lg px-10 py-4 shadow-2xl shadow-black/20 hover:scale-105 transition-transform duration-300">
            Get a free quote
          </Button>
        </div>
      </section>
    </main>
  )
}
