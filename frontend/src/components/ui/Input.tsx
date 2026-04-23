import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  /** Campo minimalista (ex.: login) — sem caixa pesada */
  variant?: 'default' | 'minimal'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, id, variant = 'default', ...props }, ref) => {
    const inputId = id ?? props.name
    return (
      <div className="w-full space-y-2 text-left">
        {label ? (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-xs font-medium',
              variant === 'minimal' ? 'text-nanb-400' : 'uppercase tracking-wider text-nanb-400',
            )}
          >
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full text-sm text-white placeholder:text-nanb-500',
            'transition-colors duration-200',
            variant === 'minimal'
              ? cn(
                  'h-12 rounded-none border-0 border-b border-white/10 bg-transparent px-0',
                  'focus:border-white focus:outline-none focus:ring-1 focus:ring-white/15',
                  'hover:border-white/20',
                )
              : cn(
                  'h-11 rounded-xl border border-white/10 bg-nanb-900/80 px-4 text-nanb-50 placeholder:text-nanb-400',
                  'focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15',
                  'hover:border-white/15',
                ),
            className,
          )}
          {...props}
        />
        {hint ? <p className="text-xs text-nanb-400">{hint}</p> : null}
      </div>
    )
  },
)
Input.displayName = 'Input'
