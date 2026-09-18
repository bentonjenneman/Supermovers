import type { Metadata } from 'next'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Services | Super Movers',
  description: 'Moving, delivery, and junk removal in Athens, GA. Straightforward pricing, no surprises.',
}

export default function Services() {
  return (
    <main className="bg-ink min-h-screen">
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue pt-24 pb-32 text-center px-4 relative overflow-hidden">
        {/* Abstract pattern background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="font-heading font-extrabold text-white text-4xl md:text-5xl lg:text-6xl mb-6">
            Our Services
          </h1>
          <p className="font-body text-white/90 text-lg md:text-xl font-medium">
            Straightforward pricing. No surprises on moving day. <br className="hidden md:block" /> 
            Everything you need handled by local professionals.
          </p>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-16 pb-24 px-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 md:gap-12">
          
          {/* ── MOVING ───────────────────────────────────────────────────────── */}
          <div className="bg-surface rounded-2xl shadow-xl shadow-black/40 border border-border overflow-hidden flex flex-col md:flex-row group">
            <div className="w-full md:w-2/5 bg-surface relative min-h-[250px] md:min-h-auto flex items-center justify-center p-8">
               <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-30 mix-blend-luminosity transition-opacity duration-500 group-hover:opacity-40"></div>
               <svg className="w-24 h-24 text-white relative z-10 opacity-90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
               </svg>
            </div>
            <div className="p-8 md:p-12 w-full md:w-3/5 flex flex-col justify-center">
              <div className="inline-block px-3 py-1 bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-wider rounded w-max mb-4">Core Service</div>
              <h2 className="font-heading font-extrabold text-paper text-3xl mb-4">Moving</h2>
              <p className="font-body text-ink-muted text-base leading-relaxed mb-4">
                Local and long distance, one item or a full house. The price we quote you is
                the price you pay — we show up when we say we will, wrap your furniture before
                it goes on the truck, and treat your things like they are our own. No surprise
                charges on moving day.
              </p>
              <p className="font-body text-ink-muted text-base leading-relaxed mb-8">
                Our box trucks arrive stocked with moving blankets, dollies, straps, and shrink wrap — the
                 gear it takes to protect your belongings throughout the move.
              </p>
              <Button variant="primary" href="/quote" className="w-max px-8 py-3 shadow-md shadow-brand-red/20">
                Get a free moving quote
              </Button>
            </div>
          </div>

          {/* ── DELIVERY ─────────────────────────────────────────────────────── */}
          <div className="bg-surface rounded-2xl shadow-xl shadow-black/40 border border-border overflow-hidden flex flex-col md:flex-row-reverse group">
            <div className="w-full md:w-2/5 bg-brand-blue relative min-h-[250px] md:min-h-auto flex items-center justify-center p-8">
               <svg className="w-24 h-24 text-white relative z-10 opacity-90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
               </svg>
            </div>
            <div className="p-8 md:p-12 w-full md:w-3/5 flex flex-col justify-center">
              <h2 className="font-heading font-extrabold text-paper text-3xl mb-4">Delivery</h2>
              <p className="font-body text-ink-muted text-base leading-relaxed mb-8">
                We&apos;ll pick it up and drop it off. The safety and protection of your items is
                always our first priority. We handle heavy, awkward pieces and move them more
                efficiently while keeping protection at the center of the job. We arrive when
                scheduled and handle everything from secondhand finds to brand-new furniture with care.
              </p>
              <Button variant="primary" href="/quote" className="w-max px-8 py-3 shadow-md shadow-brand-red/20">
                Get a delivery quote
              </Button>
            </div>
          </div>

          {/* ── JUNK REMOVAL ─────────────────────────────────────────────────── */}
          <div className="bg-surface rounded-2xl shadow-xl shadow-black/40 border border-border overflow-hidden flex flex-col md:flex-row group">
            <div className="w-full md:w-2/5 bg-ink relative min-h-[250px] md:min-h-auto flex items-center justify-center p-8">
               <svg className="w-24 h-24 text-white relative z-10 opacity-90 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
               </svg>
            </div>
            <div className="p-8 md:p-12 w-full md:w-3/5 flex flex-col justify-center">
              <h2 className="font-heading font-extrabold text-paper text-3xl mb-4">Junk Removal</h2>
              <p className="font-body text-ink-muted text-base leading-relaxed mb-8">
                Clearing out a garage, an estate, or just getting rid of what you don&apos;t
                need anymore? We&apos;ll haul it away. Just point to what needs to go, and
                we&apos;ll get it out of your hair and load it up. No stress, no hassle, no heavy lifting for you.
              </p>
              <Button variant="primary" href="/quote" className="w-max px-8 py-3 shadow-md shadow-brand-red/20">
                Get a removal quote
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── CUSTOMER JOURNEY ─────────────────────────────────────────────── */}
      <section className="bg-ink py-24 text-paper px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4">How It Works</h2>
            <p className="font-body text-ink-muted text-lg max-w-2xl mx-auto">
              We keep things simple, straightforward, and professional from the first call to the final box.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-border -z-10"></div>
            
            {[
              {
                step: '1',
                title: 'Request a Quote',
                desc: 'Call or submit online. We discuss your needs and provide a clear quote with no hidden fees.'
              },
              {
                step: '2',
                title: 'We Arrive on Time',
                desc: 'Our equipped truck and crew arrive ready to work. We wrap and protect your items before moving.'
              },
              {
                step: '3',
                title: 'Safe Transport',
                desc: 'We transport, unload, and place your items where you need them, with care at every step.'
              }
            ].map((item, i) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-surface border-4 border-ink flex items-center justify-center text-3xl font-heading font-extrabold text-brand-red mb-6 shadow-xl z-10">
                  {item.step}
                </div>
                <h3 className="font-heading font-bold text-xl text-paper mb-3">{item.title}</h3>
                <p className="font-body text-ink-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center">
             <Button variant="primary" href="/quote" className="px-10 py-4 text-lg">
                Start your move today
             </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
