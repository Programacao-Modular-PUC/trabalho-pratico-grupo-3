import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

type PropFlowHintProps = {
  title: string
  children: ReactNode
  autoHideMs?: number
}

export function PropFlowHint({ title, children, autoHideMs = 12_000 }: PropFlowHintProps) {
  const [open, setOpen] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
    setLeaving(true)
    unmountTimerRef.current = window.setTimeout(() => {
      setOpen(false)
      unmountTimerRef.current = null
    }, 380)
  }, [])

  useEffect(() => {
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null
      dismiss()
    }, autoHideMs)
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (unmountTimerRef.current) clearTimeout(unmountTimerRef.current)
    }
  }, [autoHideMs, dismiss])

  if (!open) return null

  return (
    <div
      className={`prop-flow-hint surface-card ${leaving ? 'is-leaving' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="prop-flow-hint__head">
        <strong className="prop-flow-hint__title">{title}</strong>
        <button type="button" className="prop-flow-hint__close" onClick={dismiss} aria-label="Fechar dica">
          ×
        </button>
      </div>
      <div className="prop-flow-hint__body">{children}</div>
    </div>
  )
}
