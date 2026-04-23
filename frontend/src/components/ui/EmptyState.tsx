import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon
  title: string
  description: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-8 py-14 text-center',
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-nanb-900">
        <Icon className="h-5 w-5 text-nanb-300" />
      </div>
      <p className="font-display text-base font-semibold text-white">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-nanb-400">{description}</p>
    </div>
  )
}
