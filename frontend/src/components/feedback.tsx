import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type ToastKind = 'success' | 'error' | 'warning' | 'info'

type ToastInput = {
  title?: string
  message: string
  kind?: ToastKind
  duration?: number
}

type ToastRecord = ToastInput & {
  id: number
}

type ConfirmOptions = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}

type PendingConfirm = ConfirmOptions & {
  resolve: (value: boolean) => void
}

type UiContextValue = {
  toast: (input: ToastInput) => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const UiContext = createContext<UiContextValue | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null)
  const idRef = useRef(0)

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const toast = useCallback(
    ({ duration = 3600, kind = 'info', ...input }: ToastInput) => {
      const id = ++idRef.current
      setToasts((current) => [...current, { id, duration, kind, ...input }])
      window.setTimeout(() => dismissToast(id), duration)
    },
    [dismissToast],
  )

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPendingConfirm({ ...options, resolve })
    })
  }, [])

  const resolveConfirm = useCallback((value: boolean) => {
    setPendingConfirm((current) => {
      current?.resolve(value)
      return null
    })
  }, [])

  useEffect(() => {
    function onExpired() {
      toast({
        kind: 'error',
        title: 'Acesso não autorizado',
        message: 'Sua sessão expirou ou você não tem permissão. Entre novamente pela tela de acesso.',
      })
    }

    window.addEventListener('noairnobnb:session-expired', onExpired)
    return () => window.removeEventListener('noairnobnb:session-expired', onExpired)
  }, [toast])

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm])

  return (
    <UiContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((item) => (
          <div key={item.id} className={`toast toast-${item.kind}`}>
            <div className="toast-content">
              {item.title && <strong>{item.title}</strong>}
              <span>{item.message}</span>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => dismissToast(item.id)}
              aria-label="Fechar notificação"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {pendingConfirm && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="modal-eyebrow">Confirmação</div>
            <h3 id="confirm-title">{pendingConfirm.title}</h3>
            <p className="muted">{pendingConfirm.description}</p>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => resolveConfirm(false)}>
                {pendingConfirm.cancelLabel ?? 'Voltar'}
              </button>
              <button
                type="button"
                className={`btn ${pendingConfirm.tone === 'danger' ? 'danger' : 'primary'}`}
                onClick={() => resolveConfirm(true)}
              >
                {pendingConfirm.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  )
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi fora de UiProvider')
  return ctx
}
