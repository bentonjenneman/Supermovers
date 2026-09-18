import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative h-[133.333vw] min-h-[540px] max-h-[620px] py-8 md:h-auto md:max-h-none md:py-32 text-center overflow-hidden flex flex-col items-center justify-center md:min-h-[85vh]">
        <Image
          src="/crew-optimized.jpg"
          alt="Super Movers team standing with their branded vehicle"
          fill
          priority
          className="object-contain object-top md:object-cover md:object-[center_62%] bg-ink -z-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/50 to-ink/90 -z-10" />

        <div className="relative flex flex-col items-center gap-3 md:gap-6 px-4 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="bg-brand-red text-white text-[11px] md:text-sm font-bold px-3 md:px-4 py-1.5 md:py-2 rounded uppercase tracking-wider shadow-lg shadow-brand-red/20">
            Free quotes, 7 days a week
          </span>

          <h1 className="font-heading font-extrabold text-white text-3xl md:text-6xl lg:text-7xl leading-tight">
            Moving, Delivery, and <br className="hidden md:block" /> Junk Removal
          </h1>

          <p className="font-body text-white/90 text-base md:text-xl max-w-2xl mx-auto font-medium">
            Athens, GA movers. We travel up to 200 miles, provide free quotes, and never charge hidden fees.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-4 mt-2 md:mt-4 w-full sm:w-auto">
            <Button variant="primary" href="/quote" className="text-base md:text-lg px-8 py-3 md:py-4 shadow-xl shadow-brand-red/30 hover:scale-105 transition-transform duration-300">
              Get a free quote
            </Button>
            <Button
              variant="secondary"
              href="tel:+14705624020"
              className="text-base md:text-lg px-8 py-3 md:py-4 border-2 border-white/80 text-white hover:bg-white hover:text-ink hover:border-white transition-all duration-300"
            >
              Call (470) 562-4020
            </Button>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-60 animate-bounce hidden md:block">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── WHAT WE DO ─────────────────────────────────────────────── */}
      <section className="bg-surface py-20 md:py-28 relative z-10 -mt-8 rounded-t-[2.5rem] md:rounded-t-[4rem] border-t border-brand-blue/60 shadow-[0_-18px_45px_rgba(0,0,0,0.65)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading font-extrabold text-paper text-3xl md:text-5xl mb-4">
              What we do
            </h2>
            <div className="w-24 h-1.5 bg-brand-red mx-auto rounded-full mb-6"></div>
            <p className="font-body text-ink-muted max-w-2xl mx-auto text-lg">
              Whether you&apos;re moving across town or clearing out a house, our team is equipped to handle the heavy lifting.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                heading: 'Moving',
                body: 'Local and long distance, one item or a full house. We blanket wrap your furniture and handle your belongings with absolute care.',
                icon: (
                  <svg className="w-10 h-10 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                )
              },
              {
                heading: 'Delivery',
                body: 'Furniture and large-item delivery done safely and quickly. We pick it up and place it exactly where you want it.',
                icon: (
                  <svg className="w-10 h-10 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                )
              },
              {
                heading: 'Junk Removal',
                body: "Clear out what you don't need, fast. From single bulky items to entire garage clean-outs, we haul it all away.",
                icon: (
                  <svg className="w-10 h-10 text-brand-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )
              },
            ].map(({ heading, body, icon }) => (
              <div
                key={heading}
                className="bg-ink rounded-2xl p-8 flex flex-col gap-4 shadow-xl shadow-black/30 border border-border hover:-translate-y-2 hover:border-brand-blue/70 transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-tint-red rounded-xl flex items-center justify-center mb-2 group-hover:bg-brand-red/20 transition-colors">
                  {icon}
                </div>
                <h3 className="font-heading font-extrabold text-paper text-2xl">{heading}</h3>
                <p className="font-body text-ink-muted text-base leading-relaxed flex-grow">{body}</p>
                <Link
                  href="/services"
                  className="inline-flex items-center text-brand-red text-base font-bold hover:text-paper transition-colors mt-4 w-max"
                >
                  Learn more 
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET SUPER MOVERS ────────────────────────────────────────────── */}
      <section className="bg-ink py-24 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-heading font-extrabold text-paper text-3xl md:text-5xl">
              Meet Super Movers
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Super Movers logo"
              className="h-24 md:h-32 w-auto mx-auto mt-8 mb-4 object-contain opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: "No hidden fees",
                body: "The price we quote you is the price you pay. We show up when we say we will, wrap your furniture before it goes on the truck, and treat your things like they are our own. No surprise charges on moving day."
              },
              {
                title: "Our trucks and crew",
                body: "Box trucks stocked with moving blankets, dollies, straps and shrink wrap — the gear it takes to get your things there without a scratch. One heavy item or a whole house, local or long distance."
              },
              {
                title: "Started by two UGA students",
                body: "Super Movers started with two UGA students who wanted to build something of their own. We went from hauling free furniture finds across town to handling full five-bedroom moves — and we still answer the phone ourselves."
              }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-bold shrink-0">
                    {i + 1}
                  </div>
                  <h3 className="font-heading font-bold text-paper text-xl">
                    {feature.title}
                  </h3>
                </div>
                <p className="font-body text-ink-muted text-base leading-relaxed pl-11">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button variant="secondary" href="/about" className="bg-transparent border border-border text-paper hover:bg-surface hover:border-paper transition-all">
              Read our story
            </Button>
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
