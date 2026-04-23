import { cn } from '@/lib/utils'

export function LogoMark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg' | 'hero'
  className?: string
}) {
  const map = {
    sm: 'h-9 w-9',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    hero: 'h-24 w-24 sm:h-28 sm:w-28',
  }
  return (
    <img
      src="/logo.png"
      alt="NoAirNoBnB"
      className={cn('rounded-2xl object-contain ring-1 ring-white/10', map[size], className)}
    />
  )
}
