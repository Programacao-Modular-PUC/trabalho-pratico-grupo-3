import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function Button({
  variant = 'secondary',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn('btn', variant, loading && 'is-loading', className)}
    >
      {children}
    </button>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumb,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  breadcrumb?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('page-header', className)}>
      {breadcrumb && <div className="page-breadcrumb">{breadcrumb}</div>}
      <div className="page-header-row">
        <div className="page-header-copy">
          {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {description && <p className="muted">{description}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </header>
  )
}

export function SectionCard({
  title,
  description,
  actions,
  className,
  children,
}: HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <section className={cn('surface-card', className)}>
      {(title || description || actions) && (
        <div className="surface-head">
          <div>
            {title && <h3>{title}</h3>}
            {description && <p className="muted">{description}</p>}
          </div>
          {actions && <div className="surface-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}

export function InlineNotice({
  tone = 'info',
  title,
  children,
}: {
  tone?: Tone
  title?: string
  children: ReactNode
}) {
  return (
    <div className={`inline-notice ${tone}`}>
      {title && <strong>{title}</strong>}
      <span>{children}</span>
    </div>
  )
}

export function StatusBadge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

export function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string
  hint?: string
  error?: string | null
  className?: string
  children: ReactNode
}) {
  return (
    <label className={cn('field', error && 'has-error', className)}>
      <span className="field-label">{label}</span>
      {children}
      {hint && !error && <span className="field-hint">{hint}</span>}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('input', props.className)} />
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('input', props.className)} />
}

export function TextAreaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn('input', props.className)} />
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="checkbox-field">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-mark" />
      <h3>{title}</h3>
      <p className="muted">{description}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Carregando informações…' }: { label?: string }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p className="muted">{label}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-block skeleton-hero" />
      <div className="skeleton-block skeleton-line" />
      <div className="skeleton-block skeleton-line short" />
      <div className="skeleton-block skeleton-line tiny" />
    </div>
  )
}

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="table-shell">{children}</div>
}

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  labelledBy,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: ModalSize
  children: ReactNode
  footer?: ReactNode
  /** id do elemento que rotula o diálogo (útil se o título for customizado fora do modal) */
  labelledBy?: string
}) {
  const autoTitleId = useId()
  const titleId = labelledBy ?? autoTitleId
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    }, 0)
    return () => window.clearTimeout(t)
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="modal-root" role="presentation">
      <button type="button" className="modal-root__backdrop" aria-label="Fechar" onClick={onClose} />
      <div
        ref={panelRef}
        className={cn('modal-panel', `modal-panel--${size}`)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="modal-panel__head">
          <div>
            <h2 id={titleId} className="modal-panel__title">
              {title}
            </h2>
            {description && <p className="modal-panel__desc muted">{description}</p>}
          </div>
          <button type="button" className="modal-panel__close" onClick={onClose} aria-label="Fechar diálogo">
            ×
          </button>
        </header>
        <div className="modal-panel__body">{children}</div>
        {footer && <footer className="modal-panel__foot">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
