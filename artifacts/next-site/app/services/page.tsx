import type { Metadata } from 'next'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Services | Super Movers',
  description: 'Moving, delivery, and junk removal in Athens, GA. Straightforward pricing, no surprises.',
}

export default function Services() {
  return (
    <main>
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-14 text-center px-4">
        <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl">
          Our Services
        </h1>
        <p className="font-body text-white/80 text-base mt-3">
          Straightforward pricing. No surprises on moving day.
        </p>
      </section>

      {/* ── MOVING ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading font-bold text-ink text-2xl mb-4">Moving</h2>
          <p className="font-body text-ink-muted text-base leading-relaxed mb-4">
            Local and long distance, one item or a full house. The price we quote you is
            the price you pay — we show up when we say we will, wrap your furniture before
            it goes on the truck, and treat your things like they are our own. No surprise
            charges on moving day.
          </p>
          <p className="font-body text-ink-muted text-base leading-relaxed mb-8">
            Box trucks stocked with moving blankets, dollies, straps and shrink wrap — the
            gear it takes to get your things there without a scratch.
          </p>
          <Button variant="primary" href="/quote">
            Get a free quote
          </Button>
        </div>
      </section>

      {/* ── DELIVERY ─────────────────────────────────────────────────────── */}
      <section className="bg-paper py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading font-bold text-ink text-2xl mb-4">Delivery</h2>
          <p className="font-body text-ink-muted text-base leading-relaxed mb-8">
            Need something delivered — furniture, an appliance, a single large item — but
            not a full moving crew? We&apos;ll pick it up and drop it off — distance evaluated
            case-by-case depending on the item and route.
          </p>
          <Button variant="primary" href="/quote">
            Get a free quote
          </Button>
        </div>
      </section>

      {/* ── JUNK REMOVAL ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading font-bold text-ink text-2xl mb-4">Junk Removal</h2>
          <p className="font-body text-ink-muted text-base leading-relaxed mb-8">
            Clearing out a garage, an estate, or just getting rid of what you don&apos;t
            need anymore? We&apos;ll haul it away.
          </p>
          <Button variant="primary" href="/quote">
            Get a free quote
          </Button>
        </div>
      </section>
    </main>
  )
}
