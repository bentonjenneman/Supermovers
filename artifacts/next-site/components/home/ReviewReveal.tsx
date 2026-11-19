'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export default function ReviewReveal({ children, className, testId }: {
  children: ReactNode
  className: string
  testId: string
}) {
  const ref = useRef<HTMLLIElement>(null)
  // Keep server-rendered reviews readable before hydration or without JavaScript.
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let observer: IntersectionObserver | null = null

    function configure() {
      observer?.disconnect()
      if (motion.matches || !('IntersectionObserver' in window)) {
        setVisible(true)
        return
      }
      // Observe the stationary list item, not its moving child, to avoid flicker.
      // The inset viewport lets the fade finish before a card leaves the screen.
      observer = new IntersectionObserver(([entry]) => {
        setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.12)
      }, { rootMargin: '-8% 0px -10% 0px', threshold: [0, 0.12] })
      observer.observe(element!)
    }

    configure()
    motion.addEventListener('change', configure)
    return () => {
      observer?.disconnect()
      motion.removeEventListener('change', configure)
    }
  }, [])

  return (
    <li ref={ref} className={className} data-testid={testId}>
      <div
        data-review-visible={visible}
        className={`transition-[opacity,transform,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none motion-reduce:!opacity-100 motion-reduce:!translate-y-0 motion-reduce:!blur-none ${visible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-5 blur-[2px]'}`}
      >
        {children}
      </div>
    </li>
  )
}
