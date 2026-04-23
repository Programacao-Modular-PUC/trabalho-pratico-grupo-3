import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  delay = 0,
  className,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-5 shadow-[var(--shadow-soft)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-nanb-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">{value}</p>
          {hint ? <p className="mt-1 text-xs text-nanb-500">{hint}</p> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-nanb-950/60">
          <Icon className="h-5 w-5 text-nanb-200" />
        </div>
      </div>
    </motion.div>
  )
}
