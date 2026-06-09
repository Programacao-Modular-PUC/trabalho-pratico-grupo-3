import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { http } from '../../api/http'
import type { Quarto, Residencia } from '../../api/types'
import { getApiErrorMessage, useAuth } from '../../auth/AuthContext'
import { useUi } from '../../components/feedback'
import { QuartoOcupacaoCalendario } from '../../components/explorar/QuartoOcupacaoCalendario'
import { ReservaOcupacaoDateTimeField } from '../../components/explorar/ReservaOcupacaoDateTimeField'
import { RoomVisual } from '../../components/roomVisual'
import { AnimatedMoney } from '../../components/AnimatedMoney'
import {
  Button,
  CheckboxField,
  Field,
  InlineNotice,
  LoadingState,
  Modal,
  PageHeader,
  SectionCard,
  StatusBadge,
  TextInput,
} from '../../components/ui'
import { formatMoney, localIso, roomTypeLabel } from '../../utils/format'
import {
  PREVIEW_DIARIA_HOUR,
  previewHospedagem,
  type HospedagemCotacaoPreview,
} from '../../utils/hospedagemPreview'

type Flow = 'reserva' | 'aluguel'

export function QuartoDetalhePage() {
  const { id } = useParams()
  const { hasRole } = useAuth()
  const { toast } = useUi()
  const [q, setQ] = useState<Quarto | null>(null)
  const [res, setRes] = useState<Residencia | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reserveLoading, setReserveLoading] = useState(false)
  const [rentLoading, setRentLoading] = useState(false)
  const [periodIn, setPeriodIn] = useState('')
  const [periodOut, setPeriodOut] = useState('')
  const [flow, setFlow] = useState<Flow>('reserva')
  const [step, setStep] = useState<1 | 2>(1)
  const [capaIdx, setCapaIdx] = useState(0)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [numHospedesInput, setNumHospedesInput] = useState('1')
  const [solicitaBerco, setSolicitaBerco] = useState(false)
  const [ocupDias, setOcupDias] = useState<Set<string>>(() => new Set())
  const [ocupCarga, setOcupCarga] = useState(false)
  const [ocupErr, setOcupErr] = useState<string | null>(null)

  const cotacaoPreview: HospedagemCotacaoPreview = useMemo(() => {
    const parsed = parseInt(numHospedesInput, 10)
    const numeroHospedes = Number.isNaN(parsed) ? undefined : parsed
    return {
      numeroHospedes,
      solicitaBerco: q?.tipoQuarto === 'CASAL' ? solicitaBerco : false,
    }
  }, [numHospedesInput, solicitaBerco, q?.tipoQuarto])

  const preview = useMemo(() => {
    if (!q) return null
    return previewHospedagem(q, periodIn, periodOut, cotacaoPreview)
  }, [q, periodIn, periodOut, cotacaoPreview])

  const previewValid = preview !== null

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)

    void (async () => {
      try {
        const { data: quarto } = await http.get<Quarto>(`/api/quartos/${id}`)
        const { data: residencia } = await http.get<Residencia>(`/api/residencias/${quarto.residenciaId}`)
        if (!active) return
        setQ(quarto)
        setRes(residencia)
      } catch (e) {
        if (!active) return
        setErr(getApiErrorMessage(e))
      } finally {
        if (active) setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    setCapaIdx(0)
  }, [q?.id])

  useEffect(() => {
    if (!q) return
    if (q.tipoQuarto === 'CASAL') setNumHospedesInput('2')
    else setNumHospedesInput('1')
    setSolicitaBerco(false)
  }, [q?.id, q?.tipoQuarto])

  useEffect(() => {
    if (!bookingOpen || !id) return
    setOcupCarga(true)
    setOcupErr(null)
    setOcupDias(new Set())
    let a = true
    void (async () => {
      try {
        const { data } = await http.get<{ diasOcupados: string[] }>(`/api/quartos/${id}/ocupacao-calendario`)
        if (a) {
          setOcupDias(new Set(data.diasOcupados))
        }
      } catch (e) {
        if (a) {
          setOcupErr(getApiErrorMessage(e))
        }
      } finally {
        if (a) setOcupCarga(false)
      }
    })()
    return () => {
      a = false
    }
  }, [bookingOpen, id])

  async function criarReserva() {
    if (!previewValid || !q) return
    setErr(null)
    setMsg(null)
    setReserveLoading(true)
    try {
      const payload: Record<string, unknown> = {
        quartoId: Number(id),
        dataHoraEntrada: localIso(periodIn),
        dataHoraSaida: localIso(periodOut),
      }
      if (q.tipoQuarto === 'FAMILIA') {
        payload.numeroHospedes = parseInt(numHospedesInput, 10)
      } else if (q.tipoQuarto === 'CASAL') {
        const n = parseInt(numHospedesInput, 10)
        if (!Number.isNaN(n)) payload.numeroHospedes = n
        payload.solicitaBerco = solicitaBerco
      }
      await http.post('/api/reservas', payload)
      setMsg('Reserva criada com sucesso para este quarto.')
      toast({
        kind: 'success',
        title: 'Reserva criada',
        message: 'Seu pedido já foi enviado ao sistema.',
      })
      setPeriodIn('')
      setPeriodOut('')
      setStep(1)
      setBookingOpen(false)
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Reserva não concluída',
        message,
      })
    } finally {
      setReserveLoading(false)
    }
  }

  async function criarAluguel() {
    if (!previewValid || !q) return
    setErr(null)
    setMsg(null)
    setRentLoading(true)
    try {
      const payload: Record<string, unknown> = {
        quartoId: Number(id),
        dataHoraEntrada: localIso(periodIn),
        dataHoraSaida: localIso(periodOut),
      }
      if (q.tipoQuarto === 'FAMILIA') {
        payload.numeroHospedes = parseInt(numHospedesInput, 10)
      } else if (q.tipoQuarto === 'CASAL') {
        const n = parseInt(numHospedesInput, 10)
        if (!Number.isNaN(n)) payload.numeroHospedes = n
        payload.solicitaBerco = solicitaBerco
      }
      await http.post('/api/alugueis', payload)
      setMsg('Aluguel criado com sucesso e pagamento gerado pela API.')
      toast({
        kind: 'success',
        title: 'Aluguel criado',
        message: 'O fluxo foi registrado e o pagamento correspondente foi gerado.',
      })
      setPeriodIn('')
      setPeriodOut('')
      setStep(1)
      setBookingOpen(false)
    } catch (e) {
      const message = getApiErrorMessage(e)
      setErr(message)
      toast({
        kind: 'error',
        title: 'Aluguel não concluído',
        message,
      })
    } finally {
      setRentLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <LoadingState label="Carregando detalhes do quarto…" />
      </div>
    )
  }

  if (!q) {
    return (
      <div className="page">
        <InlineNotice tone="danger" title="Quarto indisponível no momento">
          {err ?? 'Não foi possível localizar os detalhes deste quarto.'}
        </InlineNotice>
      </div>
    )
  }

  const bookingModal = hasRole('CLIENTE') && (
    <Modal
      open={bookingOpen}
      onClose={() => {
        setBookingOpen(false)
        setStep(1)
      }}
      title="Reserva ou aluguel"
      description="Escolha período e confirme."
      size="lg"
      footer={
        <Button type="button" variant="ghost" onClick={() => setBookingOpen(false)}>
          Fechar
        </Button>
      }
    >
      <>
      <div className="stepper" aria-label="Etapas">
        <button
          type="button"
          className={`stepper-step${step === 1 ? ' is-active' : ''}${step > 1 ? ' is-done' : ''}`}
          onClick={() => setStep(1)}
        >
          <span className="stepper-index">1</span>
          <span className="stepper-label">Período</span>
        </button>
        <span className="stepper-line" aria-hidden />
        <button
          type="button"
          className={`stepper-step${step === 2 ? ' is-active' : ''}`}
          onClick={() => previewValid && setStep(2)}
          disabled={!previewValid}
        >
          <span className="stepper-index">2</span>
          <span className="stepper-label">Confirmar</span>
        </button>
      </div>

      {step === 1 && (
        <div className="stack booking-fields" style={{ marginTop: '0.75rem' }}>
          {id && (
            <>
              <ReservaOcupacaoDateTimeField
                label="Entrada"
                hint="Corte de diária às 12h. Escolha a data no calendário: dias reservados aparecem a vermelho."
                value={periodIn}
                onChange={setPeriodIn}
                quartoId={id}
                diasOcupadosCompartilhados={ocupDias}
                ocupacaoEmCarga={ocupCarga}
                ocupacaoErro={ocupErr}
              />
              <ReservaOcupacaoDateTimeField
                label="Saída"
                hint="Mesma regra de 12h. Indisponível = mesmo aviso de ocupação no calendário."
                value={periodOut}
                onChange={setPeriodOut}
                quartoId={id}
                diasOcupadosCompartilhados={ocupDias}
                ocupacaoEmCarga={ocupCarga}
                ocupacaoErro={ocupErr}
              />
            </>
          )}
          {q.tipoQuarto === 'FAMILIA' && (
            <Field
              label="Número de hóspedes"
              className="full"
              hint={
                q.capacidadeMaximaHospedes
                  ? `Até ${q.capacidadeMaximaHospedes} pessoa(s) neste quarto.`
                  : 'Conforme camas cadastradas pelo proprietário.'
              }
            >
              <TextInput
                inputMode="numeric"
                value={numHospedesInput}
                onChange={(e) => setNumHospedesInput(e.target.value)}
              />
            </Field>
          )}
          {q.tipoQuarto === 'CASAL' && (
            <>
              <Field label="Hóspedes" className="full" hint="Padrão 2 (casal). Altere se precisar.">
                <TextInput
                  inputMode="numeric"
                  value={numHospedesInput}
                  onChange={(e) => setNumHospedesInput(e.target.value)}
                />
              </Field>
              {q.permiteBerco && (
                <CheckboxField
                  label="Solicitar berço (taxa extra, se o quarto oferecer)"
                  checked={solicitaBerco}
                  onChange={setSolicitaBerco}
                />
              )}
            </>
          )}
          <div className="modal-actions">
            <Button type="button" variant="primary" disabled={!previewValid} onClick={() => setStep(2)}>
              Continuar
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack booking-fields" style={{ marginTop: '0.75rem' }}>
          <div className="segmented" role="tablist" aria-label="Tipo de solicitação">
            <button
              type="button"
              role="tab"
              aria-selected={flow === 'reserva'}
              className={`segmented-item${flow === 'reserva' ? ' is-active' : ''}`}
              onClick={() => setFlow('reserva')}
            >
              Reserva
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={flow === 'aluguel'}
              className={`segmented-item${flow === 'aluguel' ? ' is-active' : ''}`}
              onClick={() => setFlow('aluguel')}
            >
              Aluguel
            </button>
          </div>

          <p className="muted small" style={{ margin: 0 }}>
            Estimativa local (corte {PREVIEW_DIARIA_HOUR}h, tipo e extras). Valor final pela API.
          </p>

          {flow === 'aluguel' && (
            <p className="muted small" style={{ margin: 0 }}>
              Reserva ativa no período bloqueia aluguel.
            </p>
          )}

          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Voltar
            </Button>
            {flow === 'reserva' ? (
              <Button type="button" variant="primary" loading={reserveLoading} onClick={() => void criarReserva()}>
                {reserveLoading ? 'Enviando…' : 'Confirmar reserva'}
              </Button>
            ) : (
              <Button type="button" variant="primary" loading={rentLoading} onClick={() => void criarAluguel()}>
                {rentLoading ? 'Criando…' : 'Confirmar aluguel'}
              </Button>
            )}
          </div>
        </div>
      )}

      <aside className="booking-summary">
        <div className="booking-summary-row">
          <span className="muted">Diárias (estimado)</span>
          <span className="mono booking-summary-strong">{preview ? preview.numeroDiarias : '-'}</span>
        </div>
        <div className="booking-summary-row">
          <span className="muted">Valor por diária (estimado)</span>
          <span className="mono">{preview ? formatMoney(preview.valorDiaria) : '-'}</span>
        </div>
        <div className="booking-summary-total">
          <span>Total a pagar (estimado)</span>
          <AnimatedMoney value={preview ? preview.valorTotal : null} className="booking-total-amount" />
        </div>
      </aside>
      </>
    </Modal>
  )

  return (
    <div className="page">
      {bookingModal}

      <PageHeader
        className="minimal"
        breadcrumb={
          <>
            <Link to="/explorar">Quartos</Link> / #{q.id}
          </>
        }
        title={roomTypeLabel(q.tipoQuarto)}
        description={`${q.residenciaEndereco}, ${q.residenciaNumero}`}
        actions={<StatusBadge tone={q.ativo ? 'success' : 'warning'}>{q.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>}
      />

      {(err || msg) && (
        <div className="stack page-stack-tight">
          {err && (
            <InlineNotice tone="danger" title="Erro">
              {err}
            </InlineNotice>
          )}
          {msg && (
            <InlineNotice tone="success" title="Ok">
              {msg}
            </InlineNotice>
          )}
        </div>
      )}

      <div className="detail-grid">
        <div className="detail-hero">
          <RoomVisual quarto={q} coverUrl={q.imagens?.[capaIdx]?.url} />
          {(q.imagens ?? []).length > 1 && (
            <div className="quarto-detail-thumbs" role="tablist" aria-label="Fotos do quarto">
              {(q.imagens ?? []).map((im, i) => (
                <button
                  key={im.id}
                  type="button"
                  role="tab"
                  aria-selected={i === capaIdx}
                  className={`quarto-detail-thumb${i === capaIdx ? ' is-active' : ''}`}
                  onClick={() => setCapaIdx(i)}
                >
                  <img src={im.url} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="room-tags" style={{ marginTop: '0.45rem' }}>
            <span>{roomTypeLabel(q.tipoQuarto)}</span>
            <span>{q.possuiArCondicionado ? 'Ar' : 'Sem ar'}</span>
            <span>{q.possuiHidromassagem ? 'Hidro' : 'Sem hidro'}</span>
            <span>#{q.residenciaId}</span>
          </div>
          {res && (
            <SectionCard className="minimal-pad" title="Endereço">
              <div className="stack" style={{ gap: '0.35rem' }}>
                <span>
                  {res.endereco}, {res.numero}
                </span>
                <span className="muted small">
                  {res.bairro} · {res.cep}
                </span>
                <span className="muted small">{res.telefone || res.email}</span>
              </div>
            </SectionCard>
          )}
        </div>

        <div className="detail-side-stack">
          <SectionCard className="minimal-pad" title="Diária base">
            <div className="detail-price">
              <strong>{formatMoney(q.valorBaseDiaria)}</strong>
            </div>
          </SectionCard>

          {hasRole('CLIENTE') ? (
            <SectionCard className="minimal-pad" title="Próximo passo">
              <p className="muted small" style={{ margin: '0 0 0.65rem' }}>
                Defina datas e escolha entre reserva ou aluguel - tudo em um fluxo compacto.
              </p>
              <Button type="button" variant="primary" onClick={() => setBookingOpen(true)}>
                Solicitar estadia
              </Button>
            </SectionCard>
          ) : (
            <SectionCard className="minimal-pad" title="Dias reservados">
              {id ? <QuartoOcupacaoCalendario quartoId={id} /> : null}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}
