import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage, useAuth } from '../auth/AuthContext'
import { ROTA_ENTRAR } from '../routes'
import { useUi } from '../components/feedback'
import { Button, Field, InlineNotice, TextInput } from '../components/ui'

export function RegisterPage() {
  const { register } = useAuth()
  const { toast } = useUi()
  const nav = useNavigate()
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      await register({ nome, cpf, endereco, telefone, email, senha })
      toast({
        kind: 'success',
        title: 'Conta criada',
        message: 'Você já pode usar o sistema.',
      })
      nav('/dashboard', { replace: true })
    } catch (er) {
      const message = getApiErrorMessage(er)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Erro',
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
      <h1 className="auth-panel-title" style={{ marginTop: '0.5rem' }}>
        Cadastro
      </h1>

      <form onSubmit={onSubmit} className="auth-form">
        <Field label="Nome" className="field-line">
          <TextInput value={nome} onChange={(e) => setNome(e.target.value)} required minLength={2} placeholder="" />
        </Field>
        <Field label="CPF" className="field-line" hint="11 dígitos">
          <TextInput value={cpf} onChange={(e) => setCpf(e.target.value)} required pattern="\d{11}" placeholder="" />
        </Field>
        <Field label="Endereço" className="field-line">
          <TextInput value={endereco} onChange={(e) => setEndereco(e.target.value)} required minLength={5} placeholder="" />
        </Field>
        <Field label="Telefone" className="field-line">
          <TextInput value={telefone} onChange={(e) => setTelefone(e.target.value)} required placeholder="" />
        </Field>
        <Field label="E-mail" className="field-line">
          <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="" />
        </Field>
        <Field label="Senha" className="field-line" hint="Mín. 8 caracteres">
          <TextInput value={senha} onChange={(e) => setSenha(e.target.value)} type="password" required minLength={8} placeholder="" />
        </Field>
        {err && (
          <InlineNotice tone="danger" title="Erro">
            {err}
          </InlineNotice>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          {loading ? '…' : 'Criar conta'}
        </Button>
      </form>

      <div className="auth-links">
        <Link to={ROTA_ENTRAR}>Entrar</Link>
      </div>
    </div>
  )
}
