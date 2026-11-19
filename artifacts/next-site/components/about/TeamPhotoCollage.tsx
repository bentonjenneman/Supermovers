'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type Photo = { src: string; alt: string }

const PHOTOS: Photo[] = [
  { src: '/crew-optimized.jpg', alt: 'SuperMovers crew standing with their truck' },
  { src: '/photos/The_Supermovers_Team.jpeg', alt: 'The SuperMovers team together' },
  { src: '/photos/Supermovers_Moving.JPEG', alt: 'SuperMovers crew carrying items on a move' },
  { src: '/photos/Supermovers_Table.JPEG', alt: 'SuperMovers team at their campus recruitment table' },
  { src: '/photos/Supermovers_Horizontal_Hero_Image.jpg', alt: 'SuperMovers crew holding a red sofa overhead' },
  { src: '/photos/Supermovers_Careers.JPEG', alt: 'A SuperMovers team member shaking hands at a campus event' },
  { src: '/photos/Supermovers_Table_2.JPEG', alt: 'SuperMovers team at their recruitment event' },
  { src: '/photos/Supermovers_Mobile_Hero_Image.jpeg', alt: 'The SuperMovers crew posing beneath a red sofa' },
]

const N = PHOTOS.length
const INTERVAL = 4200

function Tile({ index, className, priority, reduced }: { index: number; className: string; priority?: boolean; reduced: boolean }) {
  // Crossfade: keep previous image underneath while new one fades in.
  const [layers, setLayers] = useState<{ cur: number; prev: number | null }>({ cur: index, prev: null })
  useEffect(() => {
    setLayers((l) => (l.cur === index ? l : { cur: index, prev: l.cur }))
  }, [index])

  const render = (i: number, key: string, fading: boolean) => {
    const p = PHOTOS[i]
    return (
      <div
        key={key}
        aria-hidden={key.startsWith('p-') || undefined}
        className={`absolute inset-0 ${reduced ? '' : 'transition-opacity duration-[900ms] ease-out'} ${fading ? 'opacity-0 animate-[collageIn_900ms_ease-out_forwards]' : 'opacity-100'}`}
        style={reduced ? { animation: 'none', opacity: 1 } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.src} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.src}
          alt={p.alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="relative w-full h-full object-contain"
          data-testid={`img-collage-${i}`}
        />
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-ink border border-border shadow-xl shadow-black/40 ${className}`}>
      {layers.prev !== null && !reduced && render(layers.prev, `p-${layers.prev}`, false)}
      {render(layers.cur, `c-${layers.cur}`, layers.prev !== null && !reduced)}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5" />
    </div>
  )
}

export default function TeamPhotoCollage() {
  const [start, setStart] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [docHidden, setDocHidden] = useState(false)
  const [reduced, setReduced] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => setReduced(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])

  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden)
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const playing = !reduced && !userPaused
  const running = playing && !hovering && !focused && visible && !docHidden

  const next = useCallback(() => setStart((s) => (s + 1) % N), [])
  const prev = useCallback(() => setStart((s) => (s - 1 + N) % N), [])

  useEffect(() => {
    if (!running) return
    const t = window.setInterval(next, INTERVAL)
    return () => window.clearInterval(t)
  }, [running, next])

  const a = start
  const b = (start + 3) % N
  const c = (start + 6) % N

  return (
    <div
      ref={rootRef}
      id="team-photos"
      role="region"
      aria-roledescription="carousel"
      aria-label="Photos of the SuperMovers team"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false)
      }}
      className="max-w-3xl mx-auto"
      data-testid="collage-team"
    >
      <style>{`@keyframes collageIn{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:scale(1)}}`}</style>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4" aria-live={running ? 'off' : 'polite'}>
        <Tile index={a} priority reduced={reduced} className="col-span-2 md:col-span-3 md:row-span-2 aspect-[4/5] md:aspect-auto md:min-h-[520px]" />
        <Tile index={b} reduced={reduced} className="hidden md:block md:col-span-2 md:aspect-auto md:h-[252px]" />
        <Tile index={c} reduced={reduced} className="hidden md:block md:col-span-2 md:aspect-auto md:h-[252px]" />
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {PHOTOS.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full ${reduced ? '' : 'transition-all duration-500'} ${i === start ? 'w-7 bg-brand-red' : 'w-2.5 bg-border'}`}
            />
          ))}
        </div>
        <p className="sr-only" aria-live={running ? 'off' : 'polite'}>
          Showing photo {start + 1} of {N}
        </p>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline font-body text-xs tracking-widest text-ink-muted tabular-nums mr-1">
            {String(start + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </span>
          <CtrlButton label="Previous photo" onClick={prev} testId="button-collage-prev">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </CtrlButton>
          {!reduced && <CtrlButton
            label={playing ? 'Pause slideshow' : 'Play slideshow'}
            onClick={() => setUserPaused((p) => !p)}
            testId="button-collage-toggle"
            pressed={!playing}
          >
            {playing ? (
              <path strokeLinecap="round" strokeWidth={2.2} d="M9 6v12M15 6v12" />
            ) : (
              <path strokeLinejoin="round" strokeWidth={2} d="M8 5.5v13l10.5-6.5L8 5.5z" />
            )}
          </CtrlButton>}
          <CtrlButton label="Next photo" onClick={next} testId="button-collage-next">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </CtrlButton>
        </div>
      </div>
    </div>
  )
}

function CtrlButton({
  label,
  onClick,
  children,
  testId,
  pressed,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  testId: string
  pressed?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      data-testid={testId}
      className="w-10 h-10 rounded-full border border-border bg-ink text-paper flex items-center justify-center hover:bg-brand-red hover:border-brand-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-colors"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        {children}
      </svg>
    </button>
  )
}
