import Link from 'next/link'
import type { BannerSettings } from '@/lib/banner'

export default function HomeBanner({ banner }: { banner: BannerSettings | null }) {
  if (!banner?.title) return null
  const content = (
    <span className="mx-auto flex max-w-[1440px] items-center justify-center gap-3 px-5 py-3 md:px-12">
      <span className="min-w-0 break-words">
        <span className="block font-heading text-[18px] font-semibold leading-snug">{banner.title}</span>
        {banner.subtitle && <span className="mt-1 block font-body text-[15px] leading-snug">{banner.subtitle}</span>}
      </span>
      {banner.link && (
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
        </svg>
      )}
    </span>
  )
  const className = 'block w-full bg-brand-red text-center text-white'
  const clickable = `${className} min-h-[44px] transition-colors hover:bg-[#770000] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-paper`
  if (!banner.link) return <div className={className}>{content}</div>
  return banner.link.startsWith('/')
    ? <Link href={banner.link} className={clickable}>{content}</Link>
    : <a href={banner.link} target="_blank" rel="noopener noreferrer" className={clickable}>{content}</a>
}
