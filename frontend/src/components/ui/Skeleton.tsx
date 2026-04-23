import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-nanb-800 via-nanb-700 to-nanb-800 bg-[length:200%_100%]',
        className,
      )}
    />
  )
}
