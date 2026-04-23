import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-nanb-950',
        'disabled:pointer-events-none disabled:opacity-40',
        variant === 'primary' &&
          'bg-white text-nanb-950 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:bg-nanb-100 active:scale-[0.99]',
        variant === 'secondary' &&
          'bg-nanb-800 text-nanb-50 ring-1 ring-white/10 hover:bg-nanb-700 hover:ring-white/15',
        variant === 'outline' &&
          'border border-white/15 bg-transparent text-nanb-100 hover:border-white/25 hover:bg-white/[0.04]',
        variant === 'ghost' && 'bg-transparent text-nanb-200 hover:bg-white/[0.06] hover:text-white',
        size === 'sm' && 'h-9 px-3 text-sm',
        size === 'md' && 'h-11 px-4 text-sm',
        size === 'lg' && 'h-12 px-6 text-base',
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
