import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Super Movers logo" className="h-10 w-auto brightness-0 invert" />
              <span className="font-heading font-extrabold text-paper text-base leading-tight">
                SUPER MOVERS
              </span>
            </div>
            <a
              href="tel:+14705624020"
              className="font-body font-semibold text-sm text-paper hover:text-tint-orange transition-colors"
            >
              (470) 562-4020
            </a>
            <p className="font-body text-sm text-paper/70">
              Athens, GA — serving up to 200 miles
            </p>
          </div>

          {/* Links column */}
          <div className="flex flex-col gap-2">
            <Link
              href="/privacy-policy"
              className="font-body text-sm text-paper/70 hover:text-paper transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-body text-sm text-paper/70 hover:text-paper transition-colors"
            >
              Terms and Conditions
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-paper/10">
          <p className="font-body text-xs text-paper/50">
            &copy; {year} Super Movers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
