import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { http } from '../../api/http'
import { getApiErrorMessage } from '../../auth/AuthContext'
import { LoadingState } from '../ui'
import { DOW, MESES, buildMonthWeeks, toIsoDateLocal } from './ocupacaoDateUtils'

type OcupPayload = { diasOcupados: string[] }

type Props = { quartoId: string }

export function QuartoOcupacaoCalendario({ quartoId }: Props) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })
  const [dias, setDias] = useState<Set<string>>(() => new Set())
  const [loadState, setLoadState] = useState<'load' | 'ok' | 'err'>('load')
  const [err, setErr] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoadState('load')
    setErr(null)
    try {
      const { data } = await http.get<OcupPayload>(`/api/quartos/${quartoId}/ocupacao-calendario`)
      setDias(new Set(data.diasOcupados))
      setLoadState('ok')
    } catch (e) {
      setErr(getApiErrorMessage(e))
      setLoadState('err')
    }
  }, [quartoId])

  useEffect(() => {
    void reload()
  }, [reload])

  const { year, month, weeks } = useMemo(() => buildMonthWeeks(cursor), [cursor])

  const todayIso = toIsoDateLocal(new Date())

  function isBusy(d: number): boolean {
    return dias.has(toIsoDateLocal(new Date(year, month, d)))
  }

  function isToday(d: number): boolean {
    return toIsoDateLocal(new Date(year, month, d)) === todayIso
  }

  function prevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
  }

  if (loadState === 'load') {
    return <LoadingState label="Carregando calendário…" />
  }

  if (loadState === 'err') {
    return (
      <p className="muted small" style={{ margin: 0 }}>
        {err ?? 'Não foi possível carregar a ocupação.'}
      </p>
    )
  }

  return (
    <div className="ocup-cal">
      <div className="ocup-cal-head">
        <button type="button" className="ocup-cal-nav" onClick={prevMonth} aria-label="Mês anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="ocup-cal-title">
          {MESES[month]} {year}
        </span>
        <button type="button" className="ocup-cal-nav" onClick={nextMonth} aria-label="Próximo mês">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="ocup-cal-weekdays" aria-hidden>
        {DOW.map((d) => (
          <span key={d} className="ocup-cal-dow">
            {d}
          </span>
        ))}
      </div>
      <div className="ocup-cal-grid" role="grid" aria-label="Dias reservados ou alugados">
        {weeks.map((row, ri) => (
          <div key={ri} className="ocup-cal-row" role="row">
            {row.map((d, i) => {
              if (d == null) {
                return <div key={i} className="ocup-cal-cell ocup-cal-cell--empty" />
              }
              const busy = isBusy(d)
              const t = isToday(d)
              return (
                <div
                  key={d}
                  className={['ocup-cal-cell', busy ? 'ocup-cal-cell--busy' : '', t ? 'ocup-cal-cell--today' : '']
                    .filter(Boolean)
                    .join(' ')}
                  title={busy ? 'Indisponível (reservado ou alugado neste intervalo)' : t ? 'Hoje' : undefined}
                >
                  {d}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="muted small ocup-cal-legend" style={{ margin: '0.65rem 0 0' }}>
        Destaque: noites com reserva ativa ou aluguel registrado.
      </p>
    </div>
  )
}
