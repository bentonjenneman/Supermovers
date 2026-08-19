import Image from 'next/image'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

export default function Home() {
  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24 text-center overflow-hidden">
        <Image
          src="/hero.jpg"
          alt="Super Movers crew loading a moving truck"
          fill
          priority
          className="object-cover -z-20"
        />
        <div className="absolute inset-0 bg-ink/60 -z-10" />

        <div className="relative flex flex-col items-center gap-5 px-4">
          <span className="bg-brand-red text-white text-xs font-bold px-3 py-1.5 rounded">
            Free quotes, 7 days a week
          </span>

          <h1 className="font-heading font-extrabold text-white text-3xl md:text-5xl max-w-3xl">
            Moving, Delivery, and Junk Removal
          </h1>

          <p className="font-body text-white/80 text-base md:text-lg max-w-xl">
            Athens, GA movers. We travel up to 200 miles, free quotes, no hidden fees.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-2">
            <Button variant="primary" href="/quote">
              Get a free quote
            </Button>
            <Button
              variant="secondary"
              href="tel:+14705624020"
              className="border-white text-white hover:bg-white hover:text-ink"
            >
              Call (470) 562-4020
            </Button>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ─────────────────────────────────────────────────── */}
      <section className="bg-ink py-10">
        <div className="flex flex-wrap justify-center gap-8">
          <Badge label="No hidden fees" accent="blue" />
          <Badge label="UGA founded" accent="orange" />
          <Badge label="200-mile radius" accent="blue" />
        </div>
      </section>

      {/* ── SERVICES PREVIEW ─────────────────────────────────────────────── */}
      <section className="bg-ink py-16">
        <h2 className="font-heading font-bold text-paper text-2xl text-center mb-10">
          What we do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
          {[
            {
              heading: 'Moving',
              body: 'Local and long distance, one item or a full house.',
            },
            {
              heading: 'Delivery',
              body: 'Furniture and large-item delivery, done safely and quickly.',
            },
            {
              heading: 'Junk Removal',
              body: "Clear out what you don't need, fast.",
            },
          ].map(({ heading, body }) => (
            <div
              key={heading}
              className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-3"
            >
              <h3 className="font-heading font-bold text-paper text-lg">{heading}</h3>
              <p className="font-body text-ink-muted text-sm">{body}</p>
              <Link
                href="/services"
                className="text-brand-red text-sm font-semibold hover:underline mt-auto"
              >
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── MEET SUPER MOVERS ────────────────────────────────────────────── */}
      <section className="bg-ink py-16">
        <h2 className="font-heading font-bold text-paper text-2xl text-center">
          Meet Super Movers
        </h2>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="Super Movers logo"
          className="h-28 w-auto mx-auto my-8"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
          <div>
            <h3 className="font-heading font-bold text-paper text-lg mb-3">
              No hidden fees
            </h3>
            <p className="font-body text-ink-muted text-sm leading-relaxed">
              The price we quote you is the price you pay. We show up when we say we will,
              wrap your furniture before it goes on the truck, and treat your things like
              they are our own. No surprise charges on moving day.
            </p>
          </div>
          <div>
            <h3 className="font-heading font-bold text-paper text-lg mb-3">
              Our trucks and crew
            </h3>
            <p className="font-body text-ink-muted text-sm leading-relaxed">
              Box trucks stocked with moving blankets, dollies, straps and shrink wrap —
              the gear it takes to get your things there without a scratch. One heavy item
              or a whole house, local or long distance.
            </p>
          </div>
          <div>
            <h3 className="font-heading font-bold text-paper text-lg mb-3">
              Started by two UGA students
            </h3>
            <p className="font-body text-ink-muted text-sm leading-relaxed">
              Super Movers started with two UGA students who wanted to build something of
              their own. We went from hauling free furniture finds across town to handling
              full five-bedroom moves — and we still answer the phone ourselves.
            </p>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-12 text-center">
        <h2 className="font-heading font-bold text-white text-2xl mb-6">
          Ready to move?
        </h2>
        <Button variant="primary" href="/quote">
          Get a free quote
        </Button>
      </section>
    </main>
  )
}
