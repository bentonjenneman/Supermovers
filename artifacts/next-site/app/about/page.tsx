import type { Metadata } from 'next'
import TeamPhotoCollage from '@/components/about/TeamPhotoCollage'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'About | SuperMovers',
  description: 'SuperMovers was started by two UGA students. Learn our story and what we stand for.',
}

export default function About() {
  return (
    <main className="bg-ink min-h-screen">
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue pt-20 pb-28 text-center px-4 relative">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto mt-8">
          <h1 className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 font-heading font-extrabold text-white text-4xl md:text-5xl lg:text-6xl">
            <span>About</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/supermovers-wordmark.png"
              alt="SuperMovers"
              width={626}
              height={162}
              className="h-auto w-[min(76vw,340px)] object-contain md:w-[400px]"
            />
          </h1>
        </div>
      </section>

      {/* ── ORIGIN STORY ─────────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-12 px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-surface rounded-3xl shadow-2xl shadow-black/50 p-8 md:p-16 border border-border">
          <div className="text-center mb-10">
            <h2 className="font-heading font-extrabold text-paper text-3xl md:text-4xl mb-6">
              Our Origin Story
            </h2>
            <div className="w-16 h-1 bg-brand-red mx-auto rounded-full mb-8"></div>
            <p className="font-body text-ink-muted text-lg leading-relaxed max-w-2xl mx-auto">
              It all started with a few high school kids, one SUV, and a big dream of making some extra cash. We were wrestlers, so we were already pros at lifting, hauling, and refusing to quit. Our first “moving truck” was basically a very full SUV and a lot of confidence. But every move taught us something new, and before long we were landing our own jobs and running the show. Now we’re SuperMovers: still hardworking, still a little scrappy, and still treating our customers like they are our first.
            </p>
          </div>

          {/* ── THE TEAM (Crew Photo) ────────────────────────────────────── */}
          <div className="mt-16">
            <h3 className="font-heading font-bold text-center text-paper text-2xl mb-8">
              The Team
            </h3>
            <TeamPhotoCollage />
             <p className="text-center text-ink-muted text-sm mt-4 italic">
              Our hard-working crew ready for the next move.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT WE STAND FOR ────────────────────────────────────────────── */}
      <section className="bg-ink py-24 px-4 text-paper">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl">Our Three Principles</h2>
          <div className="mx-auto mt-4 h-[5px] w-[72px] rounded-full bg-brand-red" aria-hidden="true" />
          <p className="mt-6 font-body text-lg md:text-xl text-ink-muted">
            What Makes a Move Into a SuperMove
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-border">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-red font-heading font-extrabold text-3xl text-white">
                1.
              </div>
              <h2 className="min-w-0 font-heading font-extrabold text-2xl">
                Straight Forward Pricing
              </h2>
            </div>
            <p className="font-body text-ink-muted text-base leading-relaxed">
              2 Fees. A rate for labor and a rate for travel. That&apos;s it. What you see is what you get.
            </p>
          </div>
          
          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-border">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-red font-heading font-extrabold text-3xl text-white">
                2.
              </div>
              <h2 className="min-w-0 font-heading font-extrabold text-2xl">
                Punctuality
              </h2>
            </div>
            <p className="font-body text-ink-muted text-base leading-relaxed">
              A SuperMover never breaks his word, if we tell you we are going to be there, we will. Always on time. Always reliable.
            </p>
          </div>

          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-border">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-red font-heading font-extrabold text-3xl text-white">
                3.
              </div>
              <h2 className="min-w-0 font-heading font-extrabold text-2xl">
                Stress Free Process
              </h2>
            </div>
            <p className="font-body text-ink-muted text-base leading-relaxed">
              Our SuperMovers are trained to handle your items with the utmost respect and care. Moving is a big deal, and we treat it as such.
            </p>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-20 text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="font-heading font-extrabold text-white text-3xl md:text-4xl mb-8">
            Ready to get moving?
          </h2>
          <Button variant="primary" href="/quote" className="px-10 py-4 text-lg shadow-xl shadow-black/20">
            Get a free quote
          </Button>
        </div>
      </section>
    </main>
  )
}
