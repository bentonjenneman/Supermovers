export const DEFAULT_GOOGLE_REVIEW_URL = 'https://g.page/r/CXTwRL-orU0jEBM/review'

export default function LeaveGoogleReviewBadge({ href, className = '' }: { href?: string | null; className?: string }) {
  return (
    <a href={href || DEFAULT_GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer"
      aria-label="Leave a Google Review"
      className={`inline-flex shrink-0 items-center gap-3 rounded-full border-2 border-[#393939] bg-[#060606] p-1.5 text-white transition-colors hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:pr-5 ${className}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/google-g.png" width={28} height={28} alt="" className="h-7 w-7 object-contain" />
      </span>
      <span className="hidden whitespace-nowrap font-heading text-base font-bold md:inline">Leave a Google Review</span>
    </a>
  )
}
