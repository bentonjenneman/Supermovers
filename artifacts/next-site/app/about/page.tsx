import type { Metadata } from 'next'
import Button from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'About | Super Movers',
  description: 'Super Movers was started by two UGA students. Learn our story and what we stand for.',
}

export default function About() {
  return (
    <main>
      {/* ── INTRO BAND ───────────────────────────────────────────────────── */}
      <section className="bg-brand-blue py-14 text-center px-4">
        <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl">
          About Super Movers
        </h1>
        <p className="font-body text-white/80 text-base mt-3">
          Started by two UGA students who wanted to build something of their own.
        </p>
      </section>

      {/* ── ORIGIN STORY ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-heading font-bold text-ink text-2xl mb-4">
            How we got started
          </h2>
          <p className="font-body text-ink-muted text-base leading-relaxed">
            Super Movers started with two UGA students who wanted to build something of
            their own. We went from hauling free furniture finds across town to handling
            full five-bedroom moves — and we still answer the phone ourselves.
          </p>

          {/* TODO: replace placeholder circles with real founder headshots once supplied */}
          <div className="flex gap-6 mt-8">
            {[0, 1].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-tint-blue flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-brand-blue"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                </div>
                <p className="font-body text-ink-muted text-xs text-center mt-2">
                  Co-founder
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT WE STAND FOR ────────────────────────────────────────────── */}
      <section className="bg-paper py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto px-4">
          <div>
            <h2 className="font-heading font-bold text-ink text-lg mb-3">
              No hidden fees
            </h2>
            <p className="font-body text-ink-muted text-sm leading-relaxed">
              The price we quote you is the price you pay. We show up when we say we will,
              wrap your furniture before it goes on the truck, and treat your things like
              they are our own.
            </p>
          </div>
          <div>
            <h2 className="font-heading font-bold text-ink text-lg mb-3">
              Moving done right
            </h2>
            <p className="font-body text-ink-muted text-sm leading-relaxed">
              When we moved into our college apartment Junior year, the movers who helped us
              broke our couch. That was the inspiration to create a moving company that
              takes care of its customers items and treats them with the respect they deserve.
              Hundreds of clients later, we are doing just that and we are honored if we have
              done it for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── CLOSING CTA ──────────────────────────────────────────────────── */}
      <section className="bg-ink py-12 text-center px-4">
        <h2 className="font-heading font-bold text-white text-2xl mb-6">
          Ready to get moving?
        </h2>
        <Button variant="primary" href="/quote">
          Get a free quote
        </Button>
      </section>
    </main>
  )
}
