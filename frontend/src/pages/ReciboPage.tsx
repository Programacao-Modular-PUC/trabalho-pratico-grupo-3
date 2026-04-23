import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { http } from '../api/http'
import type { Recibo } from '../api/types'
import { getApiErrorMessage } from '../auth/AuthContext'
import { Button, InlineNotice, LoadingState, PageHeader, SectionCard, StatusBadge } from '../components/ui'
import { formatDateTime, formatMoney, roomTypeLabel, statusTone } from '../utils/format'
import '../styles/recibo-print.css'

export function ReciboPage() {
  const { aluguelId } = useParams()
  const [r, setR] = useState<Recibo | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!aluguelId) return
    void http
      .get<Recibo>(`/api/recibos/aluguel/${aluguelId}`)
      .then(({ data }) => setR(data))
      .catch((e) => setErr(getApiErrorMessage(e)))
  }, [aluguelId])

  if (err) {
    return (
      <div className="page compact">
        <InlineNotice tone="danger" title="Não foi possível carregar o recibo">
          {err}
        </InlineNotice>
      </div>
    )
  }

  if (!r) {
    return (
      <div className="page compact">
        <LoadingState label="Carregando recibo…" />
      </div>
    )
  }

  return (
    <div className="page compact recibo-page">
      <PageHeader
        className="minimal"
        title="Recibo"
        description={`#${r.aluguelId} · pagamento #${r.pagamentoId}`}
        actions={
          <>
            <StatusBadge tone={statusTone(r.statusPagamento)}>{r.statusPagamento}</StatusBadge>
            <Link className="btn ghost" to="/dashboard">
              Painel
            </Link>
          </>
        }
      />
      <div className="recibo no-print-actions">
        <header className="recibo-header">
          <img src="/logo.png" alt="" className="recibo-logo" />
          <div>
            <h1>Recibo de hospedagem</h1>
            <p className="muted small">Aluguel #{r.aluguelId} · pagamento #{r.pagamentoId}</p>
          </div>
        </header>
        <section className="recibo-grid">
          <div>
            <h3>Estadia</h3>
            <p>
              <strong>Entrada:</strong> {formatDateTime(r.dataHoraEntrada)}
            </p>
            <p>
              <strong>Saída:</strong> {formatDateTime(r.dataHoraSaida)}
            </p>
            <p>
              <strong>Diárias:</strong> {r.numeroDiarias}
            </p>
            {r.numeroHospedes != null && (
              <p>
                <strong>Hóspedes (referência do pedido):</strong> {r.numeroHospedes}
              </p>
            )}
            {r.solicitaBerco && (
              <p>
                <strong>Berço:</strong> solicitado
              </p>
            )}
            <p>
              <strong>Total:</strong> {formatMoney(r.totalAPagar)}
            </p>
          </div>
          <div>
            <h3>Cliente</h3>
            <p>{r.clienteNome}</p>
            <p className="muted small">{r.clienteEmail}</p>
          </div>
          <div>
            <h3>Quarto</h3>
            <p>Tipo: {roomTypeLabel(r.tipoQuarto)}</p>
            <p>
              Ar: {r.possuiArCondicionado ? 'sim' : 'não'} | Hidro: {r.possuiHidromassagem ? 'sim' : 'não'}
            </p>
          </div>
          <div>
            <h3>Residência</h3>
            <p>
              {r.residenciaEndereco}, {r.residenciaNumero}
            </p>
            <p>
              {r.residenciaBairro} - CEP {r.residenciaCep}
            </p>
          </div>
          <div className="recibo-full">
            <h3>Pagamento</h3>
            <p>
              <strong>ID:</strong> {r.pagamentoId}
            </p>
            <p>
              <strong>Valor:</strong> {formatMoney(r.valorPagamento)}
            </p>
            <p>
              <strong>Status:</strong> {r.statusPagamento}
            </p>
            <p>
              <strong>Forma:</strong> {r.formaPagamento}
            </p>
          </div>
        </section>
      </div>
      <SectionCard className="minimal-pad no-print-actions" title="Impressão">
        <div className="modal-actions">
          <Button type="button" variant="primary" onClick={() => window.print()}>
            Imprimir / PDF
          </Button>
        </div>
      </SectionCard>
    </div>
  )
}
