import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { http } from '../../api/http'
import { getApiErrorMessage } from '../../auth/AuthContext'
import { Field, TextInput } from '../ui'
import { PREVIEW_DIARIA_HOUR } from '../../utils/hospedagemPreview'
import { DOW, MESES, buildMonthWeeks, toIsoDateLocal } from './ocupacaoDateUtils'

const DEFAULT_HM = `${String(PREVIEW_DIARIA_HOUR).padStart(2, '0')}:00`

type OcupPayload = { diasOcupados: string[] }

function splitDateTimeLocal(s: string): { date: string | null; time: string } {
  if (!s) return { date: null, time: DEFAULT_HM }
  const p = s.split('T')
  if (!p[0]) return { date: null, time: DEFAULT_HM }
  const t = p[1] && p[1].length >= 5 ? p[1].slice(0, 5) : DEFAULT_HM
  return { date: p[0], time: t }
}

function joinDateTime(isoDate: string, hm: string): string {
  const t = hm.length === 5 ? hm : DEFAULT_HM
  return `${isoDate}T${t}`
}

function displayPt(s: string): string {
  if (!s) return ''
  const { date, time } = splitDateTimeLocal(s)
  if (!date) return ''
  const [Y, M, D] = date.split('-')
  if (!Y || !M || !D) return s
  return `${D}/${M}/${Y} · ${time}`
}

type Props = {
  label: string
  hint?: string
  value: string
  onChange: (next: string) => void
  quartoId: string
  /** Ocupação partilhada (um único GET no pai, ex. modal de reserva). */
  diasOcupadosCompartilhados?: Set<string>
  ocupacaoEmCarga?: boolean
  ocupacaoErro?: string | null
}

export function ReservaOcupacaoDateTimeField({
  label,
  hint,
  value,
  onChange,
  quartoId,
  diasOcupadosCompartilhados,
  ocupacaoEmCarga: ocupacaoEmCargaProp,
  ocupacaoErro: ocupacaoErroProp,
}: Props) {
  const idBase = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [box, setBox] = useState<{ top: number; left: number } | null>(null)
  const [dias, setDias] = useState<Set<string>>(() => new Set())
  const [ocupErrorLocal, setOcupErrorLocal] = useState<string | null>(null)
  const [fetchOcup, setFetchOcup] = useState(true)
  const usaCompartilhado = diasOcupadosCompartilhados !== undefined
  const diasEfetivos = usaCompartilhado ? diasOcupadosCompartilhados! : dias
  const errEfetivo = usaCompartilhado ? (ocupacaoErroProp ?? null) : ocupErrorLocal
  const loadEfetivo = usaCompartilhado ? (ocupacaoEmCargaProp ?? false) : fetchOcup
  const [cursor, setCursor] = useState(() => {
    const { date } = splitDateTimeLocal(value)
    if (date) {
      const [y, m, d] = date.split('-').map((x) => parseInt(x, 10))
      if (y && m) return new Date(y, m - 1, d || 1)
    }
    const n = new Date()
    return new Date(n.getFullYear(), n.getMonth(), 1)
  })

  const loadOcup = useCallback(async () => {
    if (!quartoId || usaCompartilhado) return
    setFetchOcup(true)
    setOcupErrorLocal(null)
    try {
      const { data } = await http.get<OcupPayload>(`/api/quartos/${quartoId}/ocupacao-calendario`)
      setDias(new Set(data.diasOcupados))
    } catch (e) {
      setDias(new Set())
      setOcupErrorLocal(getApiErrorMessage(e))
    } finally {
      setFetchOcup(false)
    }
  }, [quartoId, usaCompartilhado])

  useEffect(() => {
    void loadOcup()
  }, [loadOcup])

  const { time } = splitDateTimeLocal(value)

  const { year, month, weeks } = useMemo(() => buildMonthWeeks(cursor), [cursor])
  const todayIso = toIsoDateLocal(new Date())

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      setBox(null)
      return
    }
    const r = triggerRef.current.getBoundingClientRect()
    const pad = 8
    const popW = 288
    let left = r.left
    if (left + popW > window.innerWidth - 8) {
      left = window.innerWidth - 8 - popW
    }
    if (left < 8) left = 8
    setBox({ top: r.bottom + pad, left })
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      const t = e.target as Node
      if (rootRef.current?.contains(t)) return
      if (popRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc, true)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])

  useEffect(() => {
    if (!value) return
    const { date } = splitDateTimeLocal(value)
    if (date) {
      const [y, m, d0] = date.split('-').map((x) => parseInt(x, 10))
      if (y && m) {
        setCursor((cur) => {
          const d = d0 || 1
          if (cur.getFullYear() === y && cur.getMonth() === m - 1) return cur
          return new Date(y, m - 1, d)
        })
      }
    }
  }, [value])

  function isBusyDay(yd: number) {
    return diasEfetivos.has(toIsoDateLocal(new Date(year, month, yd)))
  }

  function isPast(yd: number) {
    const iso = toIsoDateLocal(new Date(year, month, yd))
    return iso < todayIso
  }

  function selectDay(yd: number) {
    const iso = toIsoDateLocal(new Date(year, month, yd))
    if (isPast(yd) || isBusyDay(yd)) return
    onChange(joinDateTime(iso, time))
    setOpen(false)
  }

  function prevMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
  }

  const popover =
    open &&
    box &&
    createPortal(
      <div
        ref={popRef}
        className="reserva-dt-popover"
        style={{ top: box.top, left: box.left }}
        role="dialog"
        aria-label="Escolher data"
        aria-modal="true"
      >
        {loadEfetivo ? (
          <p className="muted small" style={{ margin: 0, padding: '0.4rem' }}>
            Carregando ocupação…
          </p>
        ) : (
          <>
            {errEfetivo && (
              <p className="muted small" style={{ margin: '0 0 0.5rem' }}>
                {errEfetivo}
              </p>
            )}
            <div className="ocup-cal ocup-cal--popover">
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
              <div className="ocup-cal-grid" role="grid" aria-label="Dias com quarto reservado em vermelho">
                {weeks.map((row, ri) => (
                  <div key={ri} className="ocup-cal-row" role="row">
                    {row.map((d, i) => {
                      if (d == null) {
                        return <div key={i} className="ocup-cal-cell ocup-cal-cell--empty" />
                      }
                      const busy = isBusyDay(d)
                      const past = isPast(d)
                      const t = toIsoDateLocal(new Date(year, month, d)) === todayIso
                      const { date: selD } = splitDateTimeLocal(value)
                      const selected = selD === toIsoDateLocal(new Date(year, month, d))
                      return (
                        <button
                          key={d}
                          type="button"
                          className={[
                            'ocup-cal-cell',
                            'ocup-cal-cell--click',
                            busy ? 'ocup-cal-cell--busy-red' : '',
                            past && !busy ? 'ocup-cal-cell--past' : '',
                            t && !busy ? 'ocup-cal-cell--today' : '',
                            selected && !busy && !past ? 'ocup-cal-cell--sel' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => selectDay(d)}
                          disabled={busy || past}
                          title={
                            busy
                              ? 'Dia reservado ou alugado — indisponível'
                              : past
                                ? 'Data passada'
                                : `Escolher ${d}/${String(month + 1).padStart(2, '0')}/${year}`
                          }
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
              <p className="muted small" style={{ margin: '0.5rem 0 0' }}>
                Vermelho: indisponível. Horário: corte {PREVIEW_DIARIA_HOUR}h.
              </p>
            </div>
          </>
        )}
      </div>,
      document.body
    )

  return (
    <Field label={label} hint={hint} className="full">
      <div className="reserva-dt-field" ref={rootRef}>
        <div className="reserva-dt-row">
          <button
            ref={triggerRef}
            type="button"
            className="reserva-dt-cal-btn"
            id={`${idBase}-cal`}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            title="Abrir calendário"
          >
            <Calendar className="h-4 w-4" aria-hidden />
          </button>
          <TextInput
            id={`${idBase}-ro`}
            readOnly
            value={displayPt(value)}
            placeholder="Clique no calendário e escolha a data"
            onClick={() => setOpen(true)}
            style={{ flex: 1, cursor: 'pointer' }}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen(true)
              }
            }}
            aria-label={label}
          />
        </div>
        <div className="reserva-dt-time-row">
          <label className="muted small" htmlFor={`${idBase}-t`} style={{ flexShrink: 0 }}>
            Hora
          </label>
          <TextInput
            id={`${idBase}-t`}
            type="time"
            value={time}
            onChange={(e) => {
              const hm = e.target.value
              const { date } = splitDateTimeLocal(value)
              if (date) onChange(joinDateTime(date, hm))
              else {
                const ymd = toIsoDateLocal(new Date())
                onChange(joinDateTime(ymd, hm))
              }
            }}
            step={60}
            style={{ maxWidth: '7.5rem' }}
          />
        </div>
      </div>
      {popover}
    </Field>
  )
}
