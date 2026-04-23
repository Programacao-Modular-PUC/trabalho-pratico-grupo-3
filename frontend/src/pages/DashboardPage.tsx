import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { http } from '../api/http'
import type { Aluguel, Cliente, PageResponse, Pagamento, Proprietario, Quarto, Reserva, Residencia } from '../api/types'
import { getApiErrorMessage, useAuth } from '../auth/AuthContext'
import { DisponibilidadeBoard } from '../components/DisponibilidadeBoard'
import { EmptyState, InlineNotice, LoadingState, PageHeader, SectionCard, StatCard } from '../components/ui'
import { formatCompactDate, formatDateTime, formatMoney, roomTypeLabel } from '../utils/format'

type Metric = {
  label: string
  value: number
}

type Action = { to: string; title: string }

function pickNextActiveReserva(rows: Reserva[]): Reserva | null {
  const ativas = rows.filter((r) => r.status === 'ATIVA')
  if (!ativas.length) return null
  const now = Date.now()
  const futuras = ativas
    .filter((r) => new Date(r.dataHoraEntrada).getTime() >= now)
    .sort((a, b) => new Date(a.dataHoraEntrada).getTime() - new Date(b.dataHoraEntrada).getTime())
  if (futuras.length) return futuras[0]
  return ativas.sort((a, b) => new Date(b.dataHoraEntrada).getTime() - new Date(a.dataHoraEntrada).getTime())[0]
}

function reservaStatusLabel(status: string): string {
  const u = status.toUpperCase()
  if (u === 'ATIVA') return 'Confirmada'
  return status
}

export function DashboardPage() {
  const { user, hasRole } = useAuth()
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [clientDash, setClientDash] = useState<{ nome: string; next: Reserva | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const actions = useMemo<Action[]>(() => {
    if (hasRole('ADMIN')) {
      return [
        { to: '/admin/clientes', title: 'Clientes' },
        { to: '/admin/residencias', title: 'Residências' },
        { to: '/admin/operacao', title: 'Reservas e aluguéis' },
        { to: '/admin/pagamentos', title: 'Pagamentos' },
      ]
    }
    if (hasRole('PROPRIETARIO')) {
      return [
        { to: '/prop/residencias', title: 'Residências' },
        { to: '/prop/quartos', title: 'Meus quartos' },
        { to: '/prop/movimentacao', title: 'Reservas e aluguéis' },
      ]
    }
    return [
      { to: '/explorar', title: 'Explorar quartos' },
      { to: '/cli/estadias', title: 'Minhas estadias' },
      { to: '/cli/pagamentos', title: 'Pagamentos' },
    ]
  }, [hasRole])

  const primeiroNome = useMemo(() => {
    if (!clientDash?.nome) return ''
    return clientDash.nome.trim().split(/\s+/)[0] ?? ''
  }, [clientDash])

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      setLoading(true)
      setError(null)
      setClientDash(null)
      try {
        let nextMetrics: Metric[] = []

        if (hasRole('ADMIN')) {
          const [clientes, residencias, quartos, reservas, alugueis, pagamentos] = await Promise.all([
            http.get<PageResponse<Cliente>>('/api/clientes?size=1').then((response) => response.data.totalElements),
            http.get<PageResponse<Residencia>>('/api/residencias?size=1').then((response) => response.data.totalElements),
            http.get<PageResponse<Quarto>>('/api/quartos?size=1').then((response) => response.data.totalElements),
            http.get<PageResponse<Reserva>>('/api/reservas?size=1').then((response) => response.data.totalElements),
            http.get<PageResponse<Aluguel>>('/api/alugueis?size=1').then((response) => response.data.totalElements),
            http.get<PageResponse<Pagamento>>('/api/pagamentos?size=1').then((response) => response.data.totalElements),
          ])

          nextMetrics = [
            { label: 'Clientes', value: clientes },
            { label: 'Residências', value: residencias },
            { label: 'Quartos', value: quartos },
            { label: 'Reservas', value: reservas },
            { label: 'Aluguéis', value: alugueis },
            { label: 'Pagamentos', value: pagamentos },
          ]
        } else if (hasRole('PROPRIETARIO')) {
          const { data: perfil } = await http.get<Proprietario>('/api/proprietarios/perfil')
          const [residencias, quartos, reservas, alugueis] = await Promise.all([
            http
              .get<PageResponse<Residencia>>(`/api/residencias/proprietario/${perfil.id}?size=100`)
              .then((response) => response.data.content),
            http.get<PageResponse<Quarto>>('/api/quartos?size=200').then((response) => response.data.content),
            http.get<PageResponse<Reserva>>('/api/reservas?size=200').then((response) => response.data.content),
            http.get<PageResponse<Aluguel>>('/api/alugueis?size=200').then((response) => response.data.content),
          ])
          const residenciaIds = new Set(residencias.map((row) => row.id))
          const meusQuartos = quartos.filter((row) => residenciaIds.has(row.residenciaId))
          const quartoIds = new Set(meusQuartos.map((row) => row.id))
          const minhasReservas = reservas.filter((row) => quartoIds.has(row.quartoId))
          const meusAlugueis = alugueis.filter((row) => quartoIds.has(row.quartoId))

          nextMetrics = [
            { label: 'Residências', value: residencias.length },
            { label: 'Quartos', value: meusQuartos.length },
            { label: 'Reservas', value: minhasReservas.length },
            { label: 'Aluguéis', value: meusAlugueis.length },
          ]
        } else if (hasRole('CLIENTE')) {
          const { data: perfil } = await http.get<Cliente>('/api/clientes/perfil')
          const reservas = await http
            .get<PageResponse<Reserva>>(`/api/reservas/cliente/${perfil.id}?size=100`)
            .then((response) => response.data.content)
          const next = pickNextActiveReserva(reservas)
          if (active) setClientDash({ nome: perfil.nome, next })
        }

        if (active && !hasRole('CLIENTE')) setMetrics(nextMetrics)
        if (active && hasRole('CLIENTE')) setMetrics([])
      } catch (err) {
        if (active) setError(getApiErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadDashboard()
    return () => {
      active = false
    }
  }, [hasRole])

  const isCliente = hasRole('CLIENTE')

  return (
    <div className="page">
      <PageHeader
        className="minimal"
        title={isCliente ? 'Minha conta' : 'Painel'}
        description={isCliente ? undefined : user?.email}
      />

      {error && (
        <InlineNotice tone="danger" title="Erro ao carregar">
          {error}
        </InlineNotice>
      )}

      {loading ? (
        <LoadingState label="Carregando…" />
      ) : isCliente && clientDash ? (
        <>
          <h1 className="dash-hero">Bem-vindo de volta, {primeiroNome}</h1>

          {clientDash.next ? (
            <section className="dash-next-card" aria-label="Próxima reserva">
              <div className="dash-next-eyebrow">Sua próxima reserva</div>
              <div className="dash-next-head">
                <div>
                  <h2 className="dash-next-title">{roomTypeLabel(clientDash.next.tipoQuarto)}</h2>
                  <p className="dash-next-meta">{clientDash.next.residenciaEndereco}</p>
                </div>
                <span className="dash-next-badge">{reservaStatusLabel(clientDash.next.status)}</span>
              </div>
              <div className="dash-next-grid">
                <div>
                  <div className="dash-next-label">Datas</div>
                  <div className="dash-next-value">
                    {formatCompactDate(clientDash.next.dataHoraEntrada)} → {formatCompactDate(clientDash.next.dataHoraSaida)}
                  </div>
                  <div className="dash-next-meta" style={{ marginTop: '0.35rem' }}>
                    {formatDateTime(clientDash.next.dataHoraEntrada)} - {formatDateTime(clientDash.next.dataHoraSaida)}
                  </div>
                </div>
                <div>
                  <div className="dash-next-label">Valor estimado</div>
                  <div className="dash-next-price">
                    {clientDash.next.valorPrevisto ? formatMoney(clientDash.next.valorPrevisto) : '-'}
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <p className="muted" style={{ marginBottom: '2rem', maxWidth: '32rem' }}>
              Você ainda não tem uma reserva ativa. Explore quartos e escolha sua próxima estadia.
            </p>
          )}

          <div className="dash-cta-row">
            <p>Explore novos lugares e encontre sua próxima estadia.</p>
            <Link className="btn primary" to="/explorar">
              Explorar quartos →
            </Link>
          </div>

          <nav className="quick-links" aria-label="Atalhos" style={{ marginTop: '2.5rem' }}>
            {actions.map((action) => (
              <Link key={action.to} to={action.to} className="quick-link">
                {action.title}
              </Link>
            ))}
          </nav>
        </>
      ) : isCliente ? null : (
        <>
          <nav className="quick-links" aria-label="Atalhos">
            {actions.map((action) => (
              <Link key={action.to} to={action.to} className="quick-link">
                {action.title}
              </Link>
            ))}
          </nav>

          {metrics.length > 0 ? (
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <StatCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem dados"
              description="Nada a exibir para este perfil."
              action={
                <Link className="btn primary" to="/explorar">
                  Explorar
                </Link>
              }
            />
          )}

          <SectionCard className="dashboard-avail minimal-pad" title="Quartos">
            <DisponibilidadeBoard />
          </SectionCard>
        </>
      )}
    </div>
  )
}
