import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const toneMap = {
  neutral: 'border-white/10 bg-white/[0.04] text-nanb-200',
  success: 'border-white/10 bg-white/[0.06] text-nanb-100',
  warning: 'border-white/10 bg-nanb-800 text-nanb-200',
  danger: 'border-white/10 bg-nanb-900 text-nanb-300',
} as const

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: keyof typeof toneMap
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide',
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
