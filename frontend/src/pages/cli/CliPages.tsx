import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { http } from '../../api/http'
import type { Aluguel, Cliente, HistoricoLinha, PageResponse, Pagamento, Quarto, Reserva } from '../../api/types'
import { getApiErrorMessage } from '../../auth/AuthContext'
import { useUi } from '../../components/feedback'
import {
  Button,
  DataTable,
  EmptyState,
  Field,
  InlineNotice,
  LoadingState,
  Modal,
  PageHeader,
  SectionCard,
  StatusBadge,
  TextInput,
} from '../../components/ui'
import { IconExternalLink } from '../../components/propQuartoIcons'
import { formatDateTime, formatMoney, roomTypeLabel, statusTone } from '../../utils/format'

export function CliPerfilPage() {
  const { toast } = useUi()
  const [c, setC] = useState<Cliente | null>(null)
  const [nome, setNome] = useState('')
  const [endereco, setEndereco] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    void http
      .get<Cliente>('/api/clientes/perfil')
      .then(({ data }) => {
        setC(data)
        setNome(data.nome)
        setEndereco(data.endereco)
        setTelefone(data.telefone)
        setEmail(data.email)
      })
      .catch((error) => setMsg(getApiErrorMessage(error)))
      .finally(() => setLoading(false))
  }, [])

  async function salvar() {
    if (!c) return
    setMsg(null)
    try {
      await http.put(`/api/clientes/${c.id}`, { nome, endereco, telefone, email })
      toast({
        kind: 'success',
        title: 'Dados atualizados',
        message: 'Seu perfil foi salvo com sucesso.',
      })
      setEditOpen(false)
    } catch (error) {
      const message = getApiErrorMessage(error)
      setMsg(message)
      toast({
        kind: 'error',
        title: 'Não foi possível salvar',
        message,
      })
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Carregando seus dados…" />
      </div>
    )
  }

  if (!c) {
    return (
      <div className="page">
        <InlineNotice tone="danger" title="Perfil indisponível">
          {msg ?? 'Não foi possível carregar seu perfil agora.'}
        </InlineNotice>
      </div>
    )
  }

  return (
    <div className="page compact">
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar perfil"
        description="Editar dados do perfil."
        size="md"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={() => void salvar()}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="modal-form-grid">
          <Field label="Nome">
            <TextInput value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
          <Field label="Telefone">
            <TextInput value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </Field>
          <Field label="Endereço" className="full">
            <TextInput value={endereco} onChange={(e) => setEndereco(e.target.value)} />
          </Field>
          <Field label="E-mail" className="full">
            <TextInput value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <PageHeader
        eyebrow="Cliente"
        title="Meus dados"
        actions={
          <Button type="button" variant="secondary" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
        }
      />
      {msg && (
        <InlineNotice tone="danger" title="Algo precisou da sua atenção">
          {msg}
        </InlineNotice>
      )}
      <SectionCard className="minimal-pad" title="Visão geral">
        <dl className="profile-summary">
          <div>
            <dt>Nome</dt>
            <dd>{nome}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{telefone || '-'}</dd>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <dt>Endereço</dt>
            <dd>{endereco}</dd>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <dt>E-mail</dt>
            <dd>{email}</dd>
          </div>
        </dl>
      </SectionCard>
    </div>
  )
}

export function CliEstadiasPage() {
  const { confirm, toast } = useUi()
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'alugueis' ? 'alugueis' : 'reservas'

  const [resRows, setResRows] = useState<Reserva[]>([])
  const [alRows, setAlRows] = useState<Aluguel[]>([])
  const [capas, setCapas] = useState<Record<number, string | undefined>>({})
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data: me } = await http.get<Cliente>('/api/clientes/perfil')
      const [resPage, alPage] = await Promise.all([
        http.get<PageResponse<Reserva>>(`/api/reservas/cliente/${me.id}?size=100`),
        http.get<PageResponse<Aluguel>>(`/api/alugueis/cliente/${me.id}?size=100`),
      ])
      const resContent = resPage.data.content
      const alContent = alPage.data.content
      setResRows(resContent)
      setAlRows(alContent)

      const ids = new Set<number>()
      resContent.forEach((r) => ids.add(r.quartoId))
      alContent.forEach((a) => ids.add(a.quartoId))
      const capaMap: Record<number, string | undefined> = {}
      await Promise.all(
        [...ids].map(async (id) => {
          try {
            const { data } = await http.get<Quarto>(`/api/quartos/${id}`)
            capaMap[id] = data.imagens?.[0]?.url
          } catch {
            capaMap[id] = undefined
          }
        }),
      )
      setCapas(capaMap)
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadAll()
  }, [loadAll])

  function setAba(next: 'reservas' | 'alugueis') {
    setParams(next === 'reservas' ? { aba: 'reservas' } : { aba: 'alugueis' })
  }

  async function cancelarReserva(id: number) {
    const approved = await confirm({
      title: 'Cancelar reserva?',
      description: 'Confirma o cancelamento?',
      confirmLabel: 'Cancelar reserva',
      cancelLabel: 'Voltar',
      tone: 'danger',
    })
    if (!approved) return
    try {
      await http.post(`/api/reservas/${id}/cancelar`)
      toast({
        kind: 'success',
        title: 'Reserva cancelada',
        message: 'Sua solicitação foi processada com sucesso.',
      })
      await loadAll()
    } catch (error) {
      toast({
        kind: 'error',
        title: 'Não foi possível cancelar',
        message: getApiErrorMessage(error),
      })
    }
  }

  async function cancelarAluguel(id: number) {
    const approved = await confirm({
      title: 'Cancelar aluguel?',
      description: 'Cancela o aluguel ativo.',
      confirmLabel: 'Cancelar aluguel',
      cancelLabel: 'Voltar',
      tone: 'danger',
    })
    if (!approved) return
    try {
      await http.post(`/api/alugueis/${id}/cancelar`)
      toast({
        kind: 'success',
        title: 'Aluguel cancelado',
        message: 'A estadia foi cancelada com sucesso.',
      })
      await loadAll()
    } catch (error) {
      toast({
        kind: 'error',
        title: 'Não foi possível cancelar',
        message: getApiErrorMessage(error),
      })
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Cliente"
        title="Minhas estadias"
        description="Reservas pendentes de confirmação e aluguéis com recibo no mesmo lugar."
        actions={<Button variant="ghost" onClick={() => void loadAll()}>Atualizar</Button>}
      />

      <div className="tabs-inline" role="tablist" aria-label="Estadias" style={{ marginBottom: '0.85rem' }}>
        <button type="button" role="tab" className={aba === 'reservas' ? 'is-active' : ''} onClick={() => setAba('reservas')}>
          Reservas
        </button>
        <button type="button" role="tab" className={aba === 'alugueis' ? 'is-active' : ''} onClick={() => setAba('alugueis')}>
          Aluguéis
        </button>
      </div>

      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar">
          {err}
        </InlineNotice>
      )}

      {loading ? (
        <LoadingState label="Carregando…" />
      ) : aba === 'reservas' ? (
        resRows.length > 0 ? (
          <div className="prop-quarto-grid">
            {resRows.map((r) => {
              const capa = capas[r.quartoId]
              return (
                <article key={r.id} className="prop-quarto-card surface-card cli-estadia-card">
                  <div className="prop-quarto-card__visual">
                    {capa ? (
                      <img src={capa} alt="" loading="lazy" />
                    ) : (
                      <div className="prop-quarto-card__visual--empty">Sem foto</div>
                    )}
                  </div>
                  <div className="prop-quarto-card__body">
                    <div className="prop-quarto-card__head">
                      <div style={{ minWidth: 0 }}>
                        <h3>{roomTypeLabel(r.tipoQuarto)}</h3>
                        <p className="prop-quarto-card__addr">{r.residenciaEndereco}</p>
                        <p className="muted small" style={{ margin: '0.15rem 0 0' }}>
                          Reserva #{r.id} · Quarto #{r.quartoId}
                        </p>
                      </div>
                      <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
                    </div>
                    <dl className="cli-estadia-dl">
                      <dt>Entrada</dt>
                      <dd>{formatDateTime(r.dataHoraEntrada)}</dd>
                      <dt>Saída</dt>
                      <dd>{formatDateTime(r.dataHoraSaida)}</dd>
                      {r.valorPrevisto ? (
                        <>
                          <dt>Valor previsto</dt>
                          <dd className="mono">{formatMoney(r.valorPrevisto)}</dd>
                        </>
                      ) : null}
                    </dl>
                    <div className="cli-estadia-actions">
                      <Link
                        className="btn secondary"
                        to={`/explorar/${r.quartoId}`}
                        title="Ver quarto no catálogo"
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <IconExternalLink />
                          Ver quarto
                        </span>
                      </Link>
                      {r.status === 'ATIVA' ? (
                        <Button type="button" variant="secondary" onClick={() => void cancelarReserva(r.id)}>
                          Cancelar
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <SectionCard>
            <EmptyState
              title="Sem reservas"
              description="Explore o catálogo."
              action={<Link className="btn primary" to="/explorar">Quartos</Link>}
            />
          </SectionCard>
        )
      ) : alRows.length > 0 ? (
        <div className="prop-quarto-grid">
          {alRows.map((a) => {
            const capa = capas[a.quartoId]
            return (
              <article key={a.id} className="prop-quarto-card surface-card cli-estadia-card">
                <div className="prop-quarto-card__visual">
                  {capa ? (
                    <img src={capa} alt="" loading="lazy" />
                  ) : (
                    <div className="prop-quarto-card__visual--empty">Sem foto</div>
                  )}
                </div>
                <div className="prop-quarto-card__body">
                  <div className="prop-quarto-card__head">
                    <div style={{ minWidth: 0 }}>
                      <h3>{roomTypeLabel(a.tipoQuarto)}</h3>
                      <p className="prop-quarto-card__addr">{a.residenciaEndereco}</p>
                      <p className="muted small" style={{ margin: '0.15rem 0 0' }}>
                        Aluguel #{a.id} · {a.numeroDiarias} diária(s)
                      </p>
                    </div>
                    <StatusBadge tone={statusTone(a.status)}>{a.status}</StatusBadge>
                  </div>
                  <div className="prop-quarto-card__meta">
                    <span className="prop-quarto-card__price mono">{formatMoney(a.valorTotal)}</span>
                    {a.pagamentoStatus ? (
                      <span className="muted small">Pag.: {a.pagamentoStatus}</span>
                    ) : null}
                  </div>
                  <dl className="cli-estadia-dl">
                    <dt>Entrada</dt>
                    <dd>{formatDateTime(a.dataHoraEntrada)}</dd>
                    <dt>Saída</dt>
                    <dd>{formatDateTime(a.dataHoraSaida)}</dd>
                    {a.formaPagamento ? (
                      <>
                        <dt>Forma de pagamento</dt>
                        <dd>{a.formaPagamento}</dd>
                      </>
                    ) : null}
                  </dl>
                  <div className="cli-estadia-actions">
                    <Link className="btn secondary" to={`/explorar/${a.quartoId}`} title="Ver quarto no catálogo">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <IconExternalLink />
                        Ver quarto
                      </span>
                    </Link>
                    <Link className="btn primary" to={`/recibo/${a.id}`}>
                      Abrir recibo
                    </Link>
                    {a.status === 'ATIVO' ? (
                      <Button type="button" variant="secondary" onClick={() => void cancelarAluguel(a.id)}>
                        Cancelar
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <SectionCard>
          <EmptyState title="Sem aluguéis" description="Nada registrado ainda." />
        </SectionCard>
      )}
    </div>
  )
}

export function CliReservasPage() {
  return <Navigate to="/cli/estadias?aba=reservas" replace />
}

export function CliAlugueisPage() {
  return <Navigate to="/cli/estadias?aba=alugueis" replace />
}

export function CliPagamentosPage() {
  const { toast } = useUi()
  const [rows, setRows] = useState<Pagamento[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data } = await http.get<PageResponse<Pagamento>>('/api/pagamentos?size=100')
      setRows(data.content)
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])
  async function patch(id: number, status: string, forma: string) {
    try {
      await http.patch(`/api/pagamentos/${id}`, { status, formaPagamento: forma })
      toast({
        kind: 'success',
        title: 'Pagamento atualizado',
        message: 'O status foi enviado com sucesso.',
      })
      await load()
    } catch (error) {
      toast({
        kind: 'error',
        title: 'Falha ao atualizar pagamento',
        message: getApiErrorMessage(error),
      })
    }
  }
  return (
    <div className="page">
      <PageHeader
        eyebrow="Cliente"
        title="Meus pagamentos"
        actions={<Button variant="ghost" onClick={() => void load()}>Atualizar</Button>}
      />
      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar pagamentos">
          {err}
        </InlineNotice>
      )}
      {loading ? (
        <LoadingState label="Carregando pagamentos…" />
      ) : rows.length > 0 ? (
        <DataTable>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>{formatMoney(p.valor)}</td>
                    <td>
                      <StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge>
                    </td>
                    <td>
                      {p.status === 'PENDENTE' ? (
                        <Button type="button" variant="secondary" onClick={() => void patch(p.id, 'PAGO', p.formaPagamento)}>
                          Marcar como pago
                        </Button>
                      ) : (
                        <span className="muted small">Tudo em dia</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      ) : (
        <SectionCard>
          <EmptyState title="Nenhum pagamento encontrado" description="Os pagamentos vinculados às suas hospedagens aparecerão aqui." />
        </SectionCard>
      )}
    </div>
  )
}

export function CliHistoricoPage() {
  const [rows, setRows] = useState<HistoricoLinha[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data: me } = await http.get<Cliente>('/api/clientes/perfil')
      const { data } = await http.get<HistoricoLinha[]>(`/api/historico/cliente/${me.id}`)
      setRows(data)
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => {
    void load()
  }, [load])
  return (
    <div className="page">
      <PageHeader
        eyebrow="Cliente"
        title="Meu histórico"
        actions={<Button variant="ghost" onClick={() => void load()}>Atualizar</Button>}
      />
      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar histórico">
          {err}
        </InlineNotice>
      )}
      {loading ? (
        <LoadingState label="Carregando histórico…" />
      ) : rows.length > 0 ? (
        <DataTable>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Período</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h) => (
                  <tr key={`${h.tipo}-${h.id}`}>
                    <td>{h.tipo}</td>
                    <td>#{h.id}</td>
                    <td>
                      <StatusBadge tone={statusTone(h.status)}>{h.status}</StatusBadge>
                    </td>
                    <td>
                      <div className="table-cell-stack">
                        <span>{formatDateTime(h.periodoInicio)}</span>
                        <span className="muted small">{formatDateTime(h.periodoFim)}</span>
                      </div>
                    </td>
                    <td>{h.valor ? formatMoney(h.valor) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      ) : (
        <SectionCard>
          <EmptyState title="Seu histórico ainda está vazio" description="Conforme você usar a plataforma, os registros aparecerão aqui." />
        </SectionCard>
      )}
    </div>
  )
}
