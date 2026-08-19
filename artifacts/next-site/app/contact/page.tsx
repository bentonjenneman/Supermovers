import type { Metadata } from 'next'
import Button from '@/components/ui/Button'
import ServiceAreaMap from '@/components/ServiceAreaMap'

export const metadata: Metadata = {
  title: 'Contact | Super Movers',
  description: 'Call or text Super Movers 7 days a week. Athens, GA movers serving up to 200 miles.',
}

export default function Contact() {
  return (
    <main>
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-14 text-center px-4">
        <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl">
          Get in touch
        </h1>
        <p className="font-body text-white/80 text-base mt-3">
          Call or text 7 days a week — or send us a quote request.
        </p>
      </section>

      {/* ── CONTACT INFO + MAP ───────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left — contact info */}
          <div>
            <h2 className="font-heading font-bold text-ink text-xl mb-4">
              Reach us directly
            </h2>
            <a
              href="tel:+14705624020"
              className="font-body font-semibold text-lg text-brand-orange mb-2 block hover:underline"
            >
              (470) 562-4020
            </a>
            <p className="font-body text-ink-muted text-sm mb-6">
              Call or text, 7 days a week
            </p>
            <p className="font-body text-ink-muted text-sm mb-6">
              Athens, GA — serving up to 200 miles
            </p>
            <Button variant="primary" href="/quote">
              Get a free quote
            </Button>
          </div>

          {/* Right — service area map */}
          <ServiceAreaMap />
        </div>
      </section>
    </main>
  )
}
