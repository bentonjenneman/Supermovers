import Link from 'next/link'
import { socialLinks } from '@/lib/site-config'

const SOCIAL_ICONS = {
  facebook: {
    label: 'SuperMovers on Facebook',
    path: 'M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z',
  },
  instagram: {
    label: 'SuperMovers on Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.413.56.218.96.478 1.38.898.42.42.68.82.898 1.38.164.422.36 1.057.413 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.413 2.227-.218.56-.478.96-.898 1.38-.42.42-.82.68-1.38.898-.422.164-1.057.36-2.227.413-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.413a3.71 3.71 0 0 1-1.38-.898 3.71 3.71 0 0 1-.898-1.38c-.164-.422-.36-1.057-.413-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.413-2.227.218-.56.478-.96.898-1.38.42-.42.82-.68 1.38-.898.422-.164 1.057-.36 2.227-.413 1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 5.775.13 4.902.333 4.14.63a5.88 5.88 0 0 0-2.126 1.384A5.88 5.88 0 0 0 .63 4.14C.333 4.902.13 5.775.072 7.053.014 8.333 0 8.741 0 12s.014 3.667.072 4.947c.058 1.278.261 2.15.558 2.913a5.88 5.88 0 0 0 1.384 2.126A5.88 5.88 0 0 0 4.14 23.37c.763.297 1.635.5 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.278-.058 2.15-.261 2.913-.558a5.88 5.88 0 0 0 2.126-1.384 5.88 5.88 0 0 0 1.384-2.126c.297-.763.5-1.635.558-2.913.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.058-1.278-.261-2.15-.558-2.913a5.88 5.88 0 0 0-1.384-2.126A5.88 5.88 0 0 0 19.86.63C19.097.333 18.225.13 16.947.072 15.667.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  },
  google: {
    label: 'SuperMovers Google Business Profile',
    path: '',
  },
  youtube: {
    label: 'SuperMovers on YouTube',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
} as const

export default function Footer() {
  const year = new Date().getFullYear()
  const socials = (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[]).filter(
    (key) => socialLinks[key].trim() !== ''
  )

  return (
    <footer id="footer" className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

          {/* Brand column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="SuperMovers logo" className="h-16 w-auto object-contain" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/supermovers-wordmark.png" alt="SuperMovers" width={626} height={162} className="h-auto w-44 object-contain sm:w-48" />
            </div>
            <a
              href="tel:+14705624020"
              className="font-body font-semibold text-sm text-paper hover:text-brand-red transition-colors"
            >
              (470) 562-4020
            </a>
            <p className="font-body text-sm text-paper/70">
              Athens, GA
            </p>
          </div>

          {/* Follow us column */}
          {socials.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="font-heading font-semibold text-sm text-paper">Follow us</p>
              <ul className="flex gap-3">
                {socials.map((key) => (
                  <li key={key}>
                    <a
                      href={socialLinks[key]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_ICONS[key].label}
                      title={SOCIAL_ICONS[key].label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3a3a3a] text-paper transition-colors duration-200 hover:border-paper motion-reduce:transition-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-paper"
                    >
                      {key === 'google' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src="/google-g.png" alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                          <path d={SOCIAL_ICONS[key].path} />
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
            &copy; {year} SuperMovers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
