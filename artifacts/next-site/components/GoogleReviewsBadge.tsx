export interface GoogleBadgeStats {
  average_rating?: number | null
  total_review_count?: number | null
}

const star = '25,0 30.88,16.91 48.78,17.27 34.51,28.09 39.69,45.23 25,35 10.31,45.23 15.49,28.09 1.22,17.27 19.12,16.91'
const formatCount = new Intl.NumberFormat('en-US')

export default function GoogleReviewsBadge({ stats, className }: { stats: GoogleBadgeStats | null; className?: string }) {
  const rating = stats?.average_rating
  const count = stats?.total_review_count
  const ratingLabel = typeof rating === 'number' && rating >= 1 && rating <= 5 ? rating.toFixed(1) : null
  const countLabel = typeof count === 'number' && Number.isSafeInteger(count) && count >= 0
    ? count >= 100 ? `${formatCount.format(Math.floor(count / 100) * 100)}+` : formatCount.format(count)
    : null
  const label = ['Google Reviews', ratingLabel && `${ratingLabel} out of 5 stars`, countLabel && `${countLabel} ${count === 1 ? 'review' : 'reviews'}`].filter(Boolean).join(', ')

  return (
    <svg viewBox="0 0 640 168" width={640} height={168} role="img" aria-label={label} className={className}>
      <path d="M0,142 L0,55 A55,55 0 0 1 110,55 L110,66 A9,9 0 0 0 128,66 L128,26 A18,18 0 0 1 146,8 L470,8 A26,26 0 0 1 496,34 L496,52 A26,26 0 0 0 522,78 L614,78 A26,26 0 0 1 640,104 L640,142 A26,26 0 0 1 614,168 L26,168 A26,26 0 0 1 0,142 Z" fill="#060606" stroke="#3a3a3a" strokeWidth="2" />
      <circle cx={55} cy={50} r={30} fill="white" />
      <image x={34} y={29} width={42} height={42} href="/google-g.png" />
      {ratingLabel && Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, Number(ratingLabel) - index))
        return (
          <g key={index} transform={`translate(${165 + index * 62} 16)`}>
            <polygon points={star} fill="#4a4537" />
            {fill > 0 && <svg width={50 * fill} height={48} overflow="hidden"><polygon points={star} fill="#FBBC04" /></svg>}
          </g>
        )
      })}
      <text x={320} y={ratingLabel || countLabel ? 134 : 118} textAnchor="middle" fill="#F5F1ED" fontFamily="var(--font-poppins), system-ui, sans-serif" fontSize={32}>
        {ratingLabel && <tspan fontWeight={800}>{ratingLabel}{' '}</tspan>}
        <tspan>{ratingLabel ? 'Rating' : 'Google Reviews'}</tspan>
        {countLabel && (
          <>
            <tspan>{ratingLabel ? ' on ' : ' · '}</tspan>
            <tspan fontWeight={800}>{countLabel}</tspan>
            <tspan>{count === 1 ? ' Review' : ' Reviews'}</tspan>
          </>
        )}
      </text>
    </svg>
  )
}
