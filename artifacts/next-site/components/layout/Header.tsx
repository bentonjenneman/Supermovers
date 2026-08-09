'use client'

import { useState } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo + wordmark */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Super Movers logo" className="h-9 w-auto" />
            <span className="font-heading font-extrabold text-ink text-base leading-tight">
              SUPER MOVERS
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body font-medium text-sm text-ink hover:text-brand-orange transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Phone + CTA — always visible */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+14705624020"
              className="font-body font-semibold text-sm text-ink hover:text-brand-orange transition-colors hidden sm:block"
            >
              (470) 562-4020
            </a>
            <Button variant="primary" href="/quote">
              Get a free quote
            </Button>
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 text-ink"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? (
              // X icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body font-medium text-sm text-ink hover:text-brand-orange transition-colors py-1"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="tel:+14705624020"
              className="font-body font-semibold text-sm text-ink hover:text-brand-orange transition-colors py-1 sm:hidden"
            >
              (470) 562-4020
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
