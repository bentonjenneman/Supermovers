import type { Metadata } from 'next'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'About | Super Movers',
  description: 'Super Movers was started by two UGA students. Learn our story and what we stand for.',
}

export default function About() {
  return (
    <main className="bg-ink min-h-screen">
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue pt-20 pb-28 text-center px-4 relative">
        <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-5 mix-blend-overlay"></div>
        <div className="relative z-10 max-w-3xl mx-auto mt-8">
          <h1 className="font-heading font-extrabold text-white text-4xl md:text-5xl lg:text-6xl mb-6">
            About Super Movers
          </h1>
          <p className="font-body text-white/90 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Super Movers was founded to treat customers&apos; items with the respect they deserve, bringing a strong work ethic to every job.
          </p>
        </div>
      </section>

      {/* ── ORIGIN STORY ─────────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-12 px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-surface rounded-3xl shadow-2xl shadow-black/50 p-8 md:p-16 border border-border">
          <div className="text-center mb-10">
            <h2 className="font-heading font-extrabold text-paper text-3xl md:text-4xl mb-6">
              How we got started
            </h2>
            <div className="w-16 h-1 bg-brand-red mx-auto rounded-full mb-8"></div>
            <p className="font-body text-ink-muted text-lg leading-relaxed max-w-2xl mx-auto">
              Super Movers started with two UGA students who wanted to build something of
              their own. We went from hauling free furniture finds across town to handling
              full five-bedroom moves — and we still answer the phone ourselves.
            </p>
          </div>

          {/* ── THE TEAM (Crew Photo) ────────────────────────────────────── */}
          <div className="mt-16">
            <h3 className="font-heading font-bold text-center text-paper text-2xl mb-8">
              The Team
            </h3>
            <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-xl shadow-black/30 border border-border bg-ink">
              <Image 
                src="/crew-optimized.jpg" 
                alt="Super Movers crew with their truck"
                width={1500}
                height={2000}
                className="w-full h-auto"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
             <p className="text-center text-ink-muted text-sm mt-4 italic">
              Our hard-working crew ready for the next move.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT WE STAND FOR ────────────────────────────────────────────── */}
      <section className="bg-ink py-24 px-4 text-paper">
        <div className="max-w-4xl mx-auto text-center mb-16">
           <h2 className="font-heading font-extrabold text-3xl md:text-4xl">What we stand for</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 max-w-5xl mx-auto">
          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-border">
            <div className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-heading font-extrabold text-2xl mb-4">
              No hidden fees
            </h2>
            <p className="font-body text-ink-muted text-base leading-relaxed">
              The price we quote you is the price you pay. We show up when we say we will,
              wrap your furniture before it goes on the truck, and treat your things like
              they are our own. Transparency is our priority.
            </p>
          </div>
          
          <div className="bg-surface rounded-2xl p-8 md:p-10 border border-border">
            <div className="w-12 h-12 bg-brand-red rounded-xl flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514" />
              </svg>
            </div>
            <h2 className="font-heading font-extrabold text-2xl mb-4">
              Honest Hard Work
            </h2>
            <p className="font-body text-ink-muted text-base leading-relaxed">
              We started small and built this business by doing the heavy lifting right. We don&apos;t cut corners. Every job gets our full attention and respect, because our reputation rides in the back of the truck with your belongings.
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
