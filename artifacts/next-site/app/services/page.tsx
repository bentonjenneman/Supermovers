import type { Metadata } from 'next'
import Button from '@/components/ui/Button'
import { SERVICE_CARDS } from '@/lib/service-cards'
import HowItWorks from '@/components/services/HowItWorks'

export const metadata: Metadata = {
  title: 'Services | SuperMovers',
  description: 'Explore SuperMovers moving, delivery, junk removal, moving and packing, and packing services in Athens, GA. Straightforward pricing, no surprises.',
}

export default function Services() {
  return (
    <main className="bg-ink min-h-screen">
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue pt-24 pb-32 text-center px-4 relative overflow-hidden">
        {/* Abstract pattern background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="font-heading font-extrabold text-white text-4xl md:text-5xl lg:text-6xl">
            Our Super Services
          </h1>
        </div>
      </section>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <section className="relative z-20 -mt-16 pb-24 px-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 md:gap-12">
          {SERVICE_CARDS.map((service, index) => (
            <article key={service.name} className={`bg-surface rounded-2xl shadow-xl shadow-black/40 border border-border overflow-hidden flex flex-col group ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="w-full md:w-2/5 shrink-0 bg-surface relative h-[260px] sm:h-[320px] md:h-auto md:min-h-[340px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={service.image}
                  alt={service.alt}
                  loading="lazy"
                  decoding="async"
                  style={{ objectPosition: service.position }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>
              <div className="p-6 sm:p-8 md:p-12 w-full md:w-3/5 flex flex-col justify-center">
                {index === 0 && <div className="inline-block px-3 py-1 bg-brand-red/10 text-brand-red font-bold text-xs uppercase tracking-wider rounded w-max mb-4">Core Service</div>}
                <h2 className="font-heading font-extrabold text-paper text-3xl mb-4">{service.name}</h2>
                {service.description.map(paragraph => (
                  <p key={paragraph} className="font-body text-ink-muted text-base leading-relaxed mb-4">{paragraph}</p>
                ))}
                <Button variant="primary" href={`/quote?service=${service.slug}`} className="mt-4 w-full sm:w-fit max-w-full px-6 py-3 shadow-md shadow-brand-red/20">
                  {service.quoteLabel}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── CUSTOMER JOURNEY ─────────────────────────────────────────────── */}
      <HowItWorks />
    </main>
  )
}
