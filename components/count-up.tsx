'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Counts a stat value up to its target when it scrolls into view.
 * Accepts values like "30+" or "100+" — the numeric part animates and any
 * suffix is preserved. Renders the final value as text for screen readers.
 */
export function CountUp({
  value,
  duration = 1400,
}: {
  value: string
  duration?: number
}) {
  const match = value.match(/^(\d+)(.*)$/)
  const target = match ? Number(match[1]) : 0
  const suffix = match ? match[2] : value

  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || !match) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(target)
      setDone(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        let frame = 0
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          // Ease-out-cubic: fast start, gentle landing.
          const eased = 1 - Math.pow(1 - t, 3)
          setDisplay(Math.round(eased * target))
          if (t < 1) {
            frame = requestAnimationFrame(tick)
          } else {
            setDone(true)
          }
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
      },
      { threshold: 0.4 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [target, duration, match])

  if (!match) return <span>{value}</span>

  return (
    <span ref={ref}>
      <span aria-hidden="true" className="tabular-nums">
        {done ? target : display}
        {suffix}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}
