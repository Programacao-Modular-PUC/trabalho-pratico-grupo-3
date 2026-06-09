import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { http } from '../../api/http'
import type {
  Aluguel,
  Cliente,
  HistoricoLinha,
  PageResponse,
  Pagamento,
  Proprietario,
  Quarto,
  Reserva,
  Residencia,
} from '../../api/types'
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
  SelectInput,
  StatusBadge,
  TextInput,
} from '../../components/ui'
import { formatDateTime, formatMoney, roomTypeLabel, statusTone } from '../../utils/format'

function useLoad<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      setData(await loader())
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [loader])

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, err, loading, reload }
}

export function AdminClientesPage() {
  const loader = useCallback(() => http.get<PageResponse<Cliente>>('/api/clientes').then((r) => r.data), [])
  const { data, err, loading, reload } = useLoad(loader)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Administração"
        title="Clientes"
        actions={<Button variant="ghost" onClick={() => void reload()}>Atualizar</Button>}
      />
      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar clientes">
          {err}
        </InlineNotice>
      )}
      {loading ? (
        <LoadingState label="Carregando clientes…" />
      ) : data && data.content.length > 0 ? (
        <DataTable>
          <div className="table-header">
            <h3 style={{ margin: 0 }}>Lista de clientes</h3>
          </div>
          <div className="table-meta">
            <span className="muted">{data.totalElements} cliente(s) encontrados.</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Contato</th>
                  <th>Documento</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((c) => (
                  <tr key={c.id}>
                    <td>#{c.id}</td>
                    <td>
                      <div className="table-cell-stack">
                        <strong>{c.nome}</strong>
                        <span className="muted small">{c.endereco}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-stack">
                        <span>{c.email}</span>
                        <span className="muted small">{c.telefone}</span>
                      </div>
                    </td>
                    <td>{c.cpf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      ) : (
        <SectionCard>
          <EmptyState title="Sem clientes" description="Lista vazia." />
        </SectionCard>
      )}
    </div>
  )
}

export function AdminResidenciasPage() {
  const { confirm, toast } = useUi()
  const [propsList, setPropsList] = useState<Proprietario[]>([])
  const [form, setForm] = useState({
    endereco: '',
    numero: '',
    bairro: '',
    cep: '',
    telefone: '',
    email: '',
    proprietarioId: '',
  })
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const loader = useCallback(() => http.get<PageResponse<Residencia>>('/api/residencias').then((r) => r.data), [])
  const { data, err, loading, reload } = useLoad(loader)

  useEffect(() => {
    void http.get<PageResponse<Proprietario>>('/api/proprietarios?size=100').then((r) => setPropsList(r.data.content))
  }, [])

  async function criar() {
    setFormMessage(null)
    try {
      await http.post('/api/residencias', {
        ...form,
        proprietarioId: Number(form.proprietarioId),
      })
      setForm({
        endereco: '',
        numero: '',
        bairro: '',
        cep: '',
        telefone: '',
        email: '',
        proprietarioId: '',
      })
      setFormMessage('Residência criada com sucesso.')
      toast({
        kind: 'success',
        title: 'Residência criada',
        message: 'A nova unidade já faz parte da operação.',
      })
      void reload()
      setModalOpen(false)
    } catch (e) {
      const message = getApiErrorMessage(e)
      setFormMessage(message)
      toast({
        kind: 'error',
        title: 'Não foi possível criar a residência',
        message,
      })
    }
  }

  async function excluir(id: number) {
    const shouldDelete = await confirm({
      title: 'Excluir residência?',
      description: 'Remove a residência.',
      confirmLabel: 'Excluir residência',
      cancelLabel: 'Voltar',
      tone: 'danger',
    })
    if (!shouldDelete) return

    try {
      await http.delete(`/api/residencias/${id}`)
      toast({
        kind: 'success',
        title: 'Residência excluída',
        message: 'O cadastro foi removido com sucesso.',
      })
      void reload()
    } catch (e) {
      toast({
        kind: 'error',
        title: 'Exclusão não concluída',
        message: getApiErrorMessage(e),
      })
    }
  }

  return (
    <div className="page">
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nova residência"
        description="Vincule ao proprietário e informe o endereço completo."
        size="lg"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={() => void criar()}>
              Salvar residência
            </Button>
          </>
        }
      >
        <div className="modal-form-grid">
          <Field label="Proprietário" className="full">
            <SelectInput value={form.proprietarioId} onChange={(e) => setForm({ ...form, proprietarioId: e.target.value })}>
              <option value="">Selecione</option>
              {propsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.nome}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="E-mail de contato" className="full">
            <TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Endereço" className="full">
            <TextInput value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </Field>
          <Field label="Número">
            <TextInput value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          </Field>
          <Field label="Bairro">
            <TextInput value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
          </Field>
          <Field label="CEP">
            <TextInput value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} />
          </Field>
          <Field label="Telefone" className="full">
            <TextInput value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </Field>
        </div>
        {formMessage && (
          <div style={{ marginTop: '0.65rem' }}>
            <InlineNotice tone={formMessage.includes('sucesso') ? 'success' : 'danger'}>{formMessage}</InlineNotice>
          </div>
        )}
      </Modal>

      <PageHeader
        eyebrow="Administração"
        title="Residências"
        actions={
          <>
            <Button type="button" variant="primary" onClick={() => setModalOpen(true)}>
              Nova residência
            </Button>
            <Button variant="ghost" onClick={() => void reload()}>
              Atualizar
            </Button>
          </>
        }
      />

      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar residências">
          {err}
        </InlineNotice>
      )}

      {loading ? (
        <LoadingState label="Carregando residências…" />
      ) : data && data.content.length > 0 ? (
        <DataTable>
          <div className="table-header">
            <h3 style={{ margin: 0 }}>Residências cadastradas</h3>
          </div>
          <div className="table-meta">
            <span className="muted">{data.totalElements} residência(s) ativas no cadastro.</span>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Endereço</th>
                  <th>Proprietário</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((r) => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>
                      <div className="table-cell-stack">
                        <strong>
                          {r.endereco}, {r.numero}
                        </strong>
                        <span className="muted small">
                          {r.bairro} · CEP {r.cep}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-stack">
                        <span>{r.proprietarioNome}</span>
                        <span className="muted small">{r.email}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Button type="button" variant="danger" onClick={() => void excluir(r.id)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      ) : (
        <SectionCard>
          <EmptyState title="Sem residências" description="Cadastre a primeira." />
        </SectionCard>
      )}
    </div>
  )
}

export function AdminQuartosPage() {
  const loader = useCallback(() => http.get<PageResponse<Quarto>>('/api/quartos?size=100').then((r) => r.data), [])
  const { data, err, loading, reload } = useLoad(loader)

  return (
    <div className="page">
      <PageHeader
        eyebrow="Administração"
        title="Quartos"
        actions={<Button variant="ghost" onClick={() => void reload()}>Atualizar</Button>}
      />
      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar quartos">
          {err}
        </InlineNotice>
      )}
      {loading ? (
        <LoadingState label="Carregando quartos…" />
      ) : data && data.content.length > 0 ? (
        <DataTable>
          <div className="table-header">
            <h3 style={{ margin: 0 }}>Quartos cadastrados</h3>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Quarto</th>
                  <th>Residência</th>
                  <th>Diária</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((q) => (
                  <tr key={q.id}>
                    <td>#{q.id}</td>
                    <td>
                      <div className="table-cell-stack">
                        <strong>{roomTypeLabel(q.tipoQuarto)}</strong>
                        <span className="muted small">
                          {q.possuiArCondicionado ? 'Ar-condicionado' : 'Sem ar'} ·{' '}
                          {q.possuiHidromassagem ? 'Hidromassagem' : 'Sem hidromassagem'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="table-cell-stack">
                        <span>
                          {q.residenciaEndereco}, {q.residenciaNumero}
                        </span>
                        <span className="muted small">Proprietário: {q.proprietarioNome}</span>
                      </div>
                    </td>
                    <td>{formatMoney(q.valorBaseDiaria)}</td>
                    <td>
                      <StatusBadge tone={q.ativo ? 'success' : 'warning'}>{q.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DataTable>
      ) : (
        <SectionCard>
          <EmptyState title="Nenhum quarto encontrado" description="Vazio." />
        </SectionCard>
      )}
    </div>
  )
}

export function AdminReservasPage() {
  return <Navigate to="/admin/operacao?aba=reservas" replace />
}

export function AdminAlugueisPage() {
  return <Navigate to="/admin/operacao?aba=alugueis" replace />
}

export function AdminOperacaoPage() {
  const [params, setParams] = useSearchParams()
  const aba = params.get('aba') === 'alugueis' ? 'alugueis' : 'reservas'

  const loaderReservas = useCallback(() => http.get<PageResponse<Reserva>>('/api/reservas').then((r) => r.data), [])
  const loaderAlugueis = useCallback(() => http.get<PageResponse<Aluguel>>('/api/alugueis').then((r) => r.data), [])
  const reservas = useLoad(loaderReservas)
  const alugueis = useLoad(loaderAlugueis)

  const active = aba === 'alugueis' ? alugueis : reservas

  function setAba(next: 'reservas' | 'alugueis') {
    setParams(next === 'reservas' ? { aba: 'reservas' } : { aba: 'alugueis' })
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Administração"
        title="Reservas e aluguéis"
        actions={
          <Button variant="ghost" onClick={() => void (aba === 'alugueis' ? alugueis.reload() : reservas.reload())}>
            Atualizar
          </Button>
        }
      />

      <div className="tabs-inline" role="tablist" aria-label="Área operacional" style={{ marginBottom: '0.85rem' }}>
        <button type="button" role="tab" className={aba === 'reservas' ? 'is-active' : ''} onClick={() => setAba('reservas')}>
          Reservas
        </button>
        <button type="button" role="tab" className={aba === 'alugueis' ? 'is-active' : ''} onClick={() => setAba('alugueis')}>
          Aluguéis
        </button>
      </div>

      {active.err && (
        <InlineNotice tone="danger" title={aba === 'alugueis' ? 'Falha ao carregar aluguéis' : 'Falha ao carregar reservas'}>
          {active.err}
        </InlineNotice>
      )}

      {aba === 'reservas' ? (
        active.loading ? (
          <LoadingState label="Carregando reservas…" />
        ) : (
          reservas.data && <ReservaTable rows={reservas.data.content} admin onChanged={() => void reservas.reload()} />
        )
      ) : active.loading ? (
        <LoadingState label="Carregando aluguéis…" />
      ) : (
        alugueis.data && <AluguelTable rows={alugueis.data.content} admin onChanged={() => void alugueis.reload()} />
      )}
    </div>
  )
}

export function AdminPagamentosPage() {
  const loader = useCallback(() => http.get<PageResponse<Pagamento>>('/api/pagamentos').then((r) => r.data), [])
  const { data, err, loading, reload } = useLoad(loader)
  return (
    <div className="page">
      <PageHeader
        eyebrow="Administração"
        title="Pagamentos"
        actions={<Button variant="ghost" onClick={() => void reload()}>Atualizar</Button>}
      />
      {err && (
        <InlineNotice tone="danger" title="Falha ao carregar pagamentos">
          {err}
        </InlineNotice>
      )}
      {loading ? <LoadingState label="Carregando pagamentos…" /> : data && <PagamentoTable rows={data.content} onChanged={() => void reload()} />}
    </div>
  )
}

export function AdminHistoricoPage() {
  const [rows, setRows] = useState<HistoricoLinha[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const { data } = await http.get<HistoricoLinha[]>('/api/historico/recentes?size=50')
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
        eyebrow="Administração"
        title="Histórico recente"
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
          <EmptyState title="Sem histórico recente" description="Nada ainda." />
        </SectionCard>
      )}
    </div>
  )
}

function ReservaTable({
  rows,
  admin,
  onChanged,
}: {
  rows: Reserva[]
  admin?: boolean
  onChanged: () => void
}) {
  const { confirm, toast } = useUi()

  async function cancelar(id: number) {
    const approved = await confirm({
      title: 'Cancelar reserva?',
      description: 'Confirma?',
      confirmLabel: 'Cancelar reserva',
      cancelLabel: 'Manter reserva',
      tone: 'danger',
    })
    if (!approved) return

    try {
      await http.post(`/api/reservas/${id}/cancelar`)
      toast({
        kind: 'success',
        title: 'Reserva cancelada',
        message: 'A alteração foi aplicada com sucesso.',
      })
      onChanged()
    } catch (error) {
      toast({
        kind: 'error',
        title: 'Cancelamento não concluído',
        message: getApiErrorMessage(error),
      })
    }
  }

  return rows.length > 0 ? (
    <DataTable>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Quarto</th>
              <th>Status</th>
              <th>Período</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.clienteNome}</td>
                <td>
                  <div className="table-cell-stack">
                    <span>{roomTypeLabel(r.tipoQuarto)}</span>
                    <span className="muted small">{r.residenciaEndereco}</span>
                  </div>
                </td>
                <td>
                  <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>
                </td>
                <td>
                  <div className="table-cell-stack">
                    <span>{formatDateTime(r.dataHoraEntrada)}</span>
                    <span className="muted small">{formatDateTime(r.dataHoraSaida)}</span>
                  </div>
                </td>
                <td>
                  <div className="table-actions">
                    {admin && r.status === 'ATIVA' && (
                      <Button type="button" variant="secondary" onClick={() => void cancelar(r.id)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTable>
  ) : (
    <SectionCard>
      <EmptyState title="Nenhuma reserva disponível" description="Vazio." />
    </SectionCard>
  )
}

function AluguelTable({
  rows,
  admin,
  onChanged,
}: {
  rows: Aluguel[]
  admin?: boolean
  onChanged?: () => void
}) {
  const { confirm, toast } = useUi()

  async function cancelar(id: number) {
    const approved = await confirm({
      title: 'Cancelar aluguel?',
      description: 'Cancela o aluguel.',
      confirmLabel: 'Cancelar aluguel',
      cancelLabel: 'Manter aluguel',
      tone: 'danger',
    })
    if (!approved) return

    try {
      await http.post(`/api/alugueis/${id}/cancelar`)
      toast({
        kind: 'success',
        title: 'Aluguel cancelado',
        message: 'A alteração foi aplicada com sucesso.',
      })
      onChanged?.()
    } catch (error) {
      toast({
        kind: 'error',
        title: 'Cancelamento não concluído',
        message: getApiErrorMessage(error),
      })
    }
  }

  return rows.length > 0 ? (
    <DataTable>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Período</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>#{a.id}</td>
                <td>{a.clienteNome}</td>
                <td>
                  <StatusBadge tone={statusTone(a.status)}>{a.status}</StatusBadge>
                </td>
                <td>
                  <div className="table-cell-stack">
                    <span>{formatDateTime(a.dataHoraEntrada)}</span>
                    <span className="muted small">{formatDateTime(a.dataHoraSaida)}</span>
                  </div>
                </td>
                <td>{formatMoney(a.valorTotal)}</td>
                <td>
                  <div className="table-actions">
                    <Link className="btn link" to={`/recibo/${a.id}`}>
                      Abrir recibo
                    </Link>
                    {admin && a.status === 'ATIVO' && (
                      <Button type="button" variant="secondary" onClick={() => void cancelar(a.id)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTable>
  ) : (
    <SectionCard>
      <EmptyState title="Nenhum aluguel encontrado" description="Vazio." />
    </SectionCard>
  )
}

function PagamentoTable({ rows, onChanged }: { rows: Pagamento[]; onChanged: () => void }) {
  const { toast } = useUi()

  async function patch(id: number, status: string, forma: string) {
    try {
      await http.patch(`/api/pagamentos/${id}`, { status, formaPagamento: forma })
      toast({
        kind: 'success',
        title: 'Pagamento atualizado',
        message: 'O novo status já foi enviado para a API.',
      })
      onChanged()
    } catch (error) {
      toast({
        kind: 'error',
        title: 'Não foi possível atualizar o pagamento',
        message: getApiErrorMessage(error),
      })
    }
  }

  return rows.length > 0 ? (
    <DataTable>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluguel</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>#{p.aluguelId}</td>
                <td>{formatMoney(p.valor)}</td>
                <td>
                  <StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge>
                </td>
                <td>
                  <div className="table-actions">
                    {p.status === 'PENDENTE' ? (
                      <Button type="button" variant="secondary" onClick={() => void patch(p.id, 'PAGO', p.formaPagamento)}>
                        Marcar como pago
                      </Button>
                    ) : (
                      <span className="muted small">Nenhuma ação necessária</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataTable>
  ) : (
    <SectionCard>
      <EmptyState title="Nenhum pagamento encontrado" description="As transações processadas pela operação aparecerão aqui." />
    </SectionCard>
  )
}
