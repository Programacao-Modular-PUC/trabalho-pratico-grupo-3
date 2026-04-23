import { useEffect, useState } from 'react'
import { http } from '../api/http'
import type { PageResponse, Quarto } from '../api/types'
import { getApiErrorMessage } from '../auth/AuthContext'
import { EmptyState, InlineNotice, LoadingState } from './ui'
import { IconAr, IconBedCasal, IconBedSingle, IconHidro } from './RoomIcons'
import { formatMoney, roomTypeLabel } from '../utils/format'

export function DisponibilidadeBoard() {
  const [rows, setRows] = useState<Quarto[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    void http
      .get<PageResponse<Quarto>>('/api/quartos?size=100')
      .then(({ data }) => {
        if (active) setRows(data.content)
      })
      .catch((e) => {
        if (active) setErr(getApiErrorMessage(e))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <LoadingState label="Carregando disponibilidade…" />
  }
  if (err) {
    return (
      <InlineNotice tone="danger" title="Não foi possível carregar os quartos">
        {err}
      </InlineNotice>
    )
  }
  if (rows.length === 0) {
    return <EmptyState title="Nenhum quarto cadastrado" description="Quando houver quartos no sistema, eles aparecerão neste painel." />
  }

  return (
    <div className="avail-grid" role="list">
      {rows.map((q) => (
        <article key={q.id} className="avail-card" role="listitem">
          <div className="avail-card-top">
            <span className="avail-id mono">#{q.id}</span>
            <span className={`avail-dot${q.ativo ? ' is-on' : ''}`} title={q.ativo ? 'Ativo' : 'Inativo'} aria-label={q.ativo ? 'Ativo' : 'Inativo'} />
          </div>
          <div className="avail-type" aria-hidden>
            {q.tipoQuarto === 'CASAL' ? <IconBedCasal /> : <IconBedSingle />}
            <span>{roomTypeLabel(q.tipoQuarto)}</span>
          </div>
          <div className="avail-icons" aria-label="Comodidades">
            <span className={`avail-icon-wrap${q.possuiArCondicionado ? '' : ' is-off'}`} title="Ar-condicionado">
              <IconAr />
            </span>
            <span className={`avail-icon-wrap${q.possuiHidromassagem ? '' : ' is-off'}`} title="Hidromassagem">
              <IconHidro />
            </span>
          </div>
          <div className="avail-foot">
            <span className="muted small">Diária base</span>
            <span className="mono">{formatMoney(q.valorBaseDiaria)}</span>
          </div>
        </article>
      ))}
    </div>
  )
}
