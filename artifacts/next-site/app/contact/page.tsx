import type { Metadata } from 'next'
import Button from '@/components/ui/Button'
import ServiceAreaMap from '@/components/ServiceAreaMap'
import { CONTACT_SERVICE_CITIES, SERVICE_AREA_SOURCE } from '@/lib/contact-service-area'

export const metadata: Metadata = {
  title: 'Contact | SuperMovers',
  description: 'Call or text SuperMovers 7 days a week. View the Georgia cities and communities we serve within 75 miles of Athens, GA.',
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
      <section className="bg-ink py-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Left — contact info */}
          <div>
            <h2 className="font-heading font-bold text-paper text-xl mb-4">
              Reach us directly
            </h2>
            <a
              href="tel:+14705624020"
              className="font-body font-semibold text-lg text-brand-red mb-2 block hover:underline"
            >
              (470) 562-4020
            </a>
            <p className="font-body text-ink-muted text-sm mb-6">
              Call or text, 7 days a week
            </p>
            <p className="font-body text-ink-muted text-sm mb-6">
              Athens, GA
            </p>
            <Button variant="primary" href="/quote">
              Get a free quote
            </Button>
          </div>

          {/* Right — service area map */}
          <ServiceAreaMap />
        </div>
        <div className="max-w-5xl mx-auto px-4 mt-14">
          <div className="border-t border-border pt-10">
            <h2 className="font-heading font-bold text-paper text-2xl">
              Georgia cities we serve
            </h2>
            <div className="mt-4 h-[5px] w-[72px] rounded-full bg-brand-red" aria-hidden="true" />
            <p className="font-body text-ink-muted mt-5 max-w-2xl">
              Based in Athens, we serve these Georgia cities, towns, and communities within a 75-mile radius.
            </p>
            <ul aria-label="Georgia cities, towns, and communities within 75 miles of Athens" className="mt-7 columns-2 gap-x-6 font-body text-sm text-paper sm:columns-3 lg:columns-4">
              {CONTACT_SERVICE_CITIES.map(city => (
                <li key={city} className="break-inside-avoid py-1.5 leading-relaxed">{city}</li>
              ))}
            </ul>
            <p className="mt-8 font-body text-xs leading-relaxed text-ink-muted">
              Georgia locations only. Radius measured in a straight line from Athens using each place&apos;s representative coordinates, not driving distance. List based on the{' '}
              <a href={SERVICE_AREA_SOURCE} target="_blank" rel="noopener noreferrer" className="underline hover:text-paper">U.S. Census Bureau&apos;s 2025 Gazetteer</a>.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
