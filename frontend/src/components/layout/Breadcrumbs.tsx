import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Trilha" className="flex flex-wrap items-center gap-1 text-xs text-nanb-500">
      {items.map((it, i) => (
        <span key={`${it.label}-${i}`} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-nanb-600" aria-hidden /> : null}
          {it.to ? (
            <Link to={it.to} className="transition-colors hover:text-nanb-200">
              {it.label}
            </Link>
          ) : (
            <span className={cn(i === items.length - 1 && 'text-nanb-300')}>{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
