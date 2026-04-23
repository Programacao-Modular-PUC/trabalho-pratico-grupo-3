import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Fechar modal"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className={cn(
              'relative z-10 w-full rounded-2xl border border-white/10 bg-nanb-900 shadow-[var(--shadow-card)]',
              size === 'sm' && 'max-w-md',
              size === 'md' && 'max-w-lg',
              size === 'lg' && 'max-w-3xl',
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-4">
              <h2 className="font-display text-lg font-semibold tracking-tight text-white">{title}</h2>
              <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 p-0" onClick={onClose} aria-label="Fechar">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer ? <div className="border-t border-white/10 px-6 py-4">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
