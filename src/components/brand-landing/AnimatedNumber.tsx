'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  value: string
  duration?: number
}

export default function AnimatedNumber({ value, duration = 1400 }: Props) {
  const match = value.match(/^(.*?)(\d+)(.*)$/)
  const target = match ? parseInt(match[2], 10) : 0
  const prefix = match?.[1] ?? ''
  const suffix = match?.[3] ?? ''

  const [current, setCurrent] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!match) return
    const node = ref.current
    if (!node) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) {
      setCurrent(target)
      return
    }

    const start = (now: number) => {
      const tick = (t: number) => {
        const elapsed = t - now
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCurrent(Math.round(target * eased))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true
            start(performance.now())
            io.disconnect()
          }
        }
      },
      { threshold: 0.3 }
    )
    io.observe(node)
    return () => io.disconnect()
  }, [target, duration, match])

  if (!match) return <>{value}</>

  return (
    <span ref={ref}>
      {prefix}
      {current}
      {suffix}
    </span>
  )
}
