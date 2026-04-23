import { useEffect, useRef, useState } from 'react'
import { cn } from './ui'
import { formatMoney } from '../utils/format'

type Props = {
  value: number | null
  className?: string
  idleClassName?: string
}

export function AnimatedMoney({ value, className, idleClassName }: Props) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number | null>(null)
  const animatedRef = useRef(0)

  useEffect(() => {
    if (value === null) {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      return
    }

    const from = animatedRef.current
    const to = value
    const start = performance.now()
    const duration = 380

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      const next = from + (to - from) * eased
      animatedRef.current = next
      setDisplay(next)
      if (t < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        animatedRef.current = to
      }
    }

    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [value])

  if (value === null) {
    return <span className={cn('animated-money', className, idleClassName)}>-</span>
  }

  return (
    <span className={cn('animated-money', className)} aria-live="polite">
      {formatMoney(display)}
    </span>
  )
}
