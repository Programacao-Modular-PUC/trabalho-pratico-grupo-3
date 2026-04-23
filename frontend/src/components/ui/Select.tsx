import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    const selectId = id ?? props.name
    return (
      <div className="w-full space-y-2 text-left">
        {label ? (
          <label htmlFor={selectId} className="block text-xs font-medium uppercase tracking-wider text-nanb-300">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border border-white/10 bg-nanb-900/80 px-4 pr-10 text-sm text-nanb-50',
            'transition-all duration-200 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15',
            'hover:border-white/15',
            className,
          )}
          {...props}
        >
          {children}
        </select>
      </div>
    )
  },
)
Select.displayName = 'Select'
