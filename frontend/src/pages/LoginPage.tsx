import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { getApiErrorMessage, useAuth } from '../auth/AuthContext'
import { useUi } from '../components/feedback'
import { Button, Field, InlineNotice, TextInput } from '../components/ui'

export function LoginPage() {
  const { login } = useAuth()
  const { toast } = useUi()
  const nav = useNavigate()
  const loc = useLocation() as { state?: { from?: string } }
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await login(email, senha)
      toast({
        kind: 'success',
        title: 'Login',
        message: 'Sessão iniciada.',
      })
      nav(loc.state?.from ?? '/dashboard', { replace: true })
    } catch (er) {
      const message = getApiErrorMessage(er)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Falha',
        message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout auth-layout--single">
      <div className="auth-brand">
        <img src="/logo.png" alt="" />
        <strong>NoAirNoBnb</strong>
      </div>

      <form method="post" action="#" onSubmit={onSubmit} className="auth-form" autoComplete="off">
        <Field label="E-mail" className={`field-line${err ? ' has-error' : ''}`}>
          <TextInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="username"
            placeholder=""
          />
        </Field>
        <Field label="Senha" className="field-line">
          <TextInput
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            type="password"
            required
            autoComplete="current-password"
            placeholder=""
          />
        </Field>
        {err && (
          <InlineNotice tone="danger" title="Erro">
            {err}
          </InlineNotice>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          {loading ? '…' : 'Entrar'}
        </Button>
      </form>

      <div className="auth-links">
        <Link to="/cadastro">Criar conta</Link>
      </div>

      <p className="auth-persona-foot" aria-hidden>
        <span className="is-active">Administrador</span> · <span>Hóspede</span>
      </p>
    </div>
  )
}
