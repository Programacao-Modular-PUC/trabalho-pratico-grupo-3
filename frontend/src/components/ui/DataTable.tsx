import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function DataTable({
  columns,
  children,
  className,
}: {
  columns: { key: string; label: string; className?: string; align?: 'left' | 'right' }[]
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-nanb-900/40 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-nanb-400',
                    c.align === 'right' && 'text-right',
                    c.className,
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">{children}</tbody>
        </table>
      </div>
    </div>
  )
}

export function DataRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn('transition-colors hover:bg-white/[0.03]', className)}>{children}</tr>
  )
}

export function DataCell({
  children,
  align,
  className,
}: {
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle text-nanb-200',
        align === 'right' && 'text-right tabular-nums',
        className,
      )}
    >
      {children}
    </td>
  )
}
