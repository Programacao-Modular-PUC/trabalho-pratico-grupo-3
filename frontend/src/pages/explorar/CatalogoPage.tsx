import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getToken, http } from '../../api/http'
import type { PageResponse, Quarto } from '../../api/types'
import { getApiErrorMessage, useAuth } from '../../auth/AuthContext'
import { RoomVisual } from '../../components/roomVisual'
import { Button, EmptyState, Field, InlineNotice, PageHeader, SelectInput, SkeletonCard, TextInput } from '../../components/ui'
import { formatMoney, roomTypeLabel } from '../../utils/format'

function parseDiaria(value: string): number {
  const n = Number(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

function quartoCapLine(q: Quarto): string {
  const line = [q.residenciaEndereco, q.residenciaNumero].filter(Boolean).join(', ')
  return line ? line.toUpperCase() : `QUARTO ${String(q.id).padStart(2, '0')}`
}

function quartoBairroLinha(q: Quarto): string {
  const parts = [q.residenciaEndereco, q.residenciaNumero].filter(Boolean)
  return parts.join(' · ')
}

type Faixa = '' | 'ate150' | '150300' | 'acima300'

export function CatalogoPage() {
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<PageResponse<Quarto> | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('')
  const [faixa, setFaixa] = useState<Faixa>('')
  const [filtroAr, setFiltroAr] = useState(false)
  const [filtroHidro, setFiltroHidro] = useState(false)
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false)

  async function load() {
    setLoading(true)
    setErr(null)
    try {
      const { data: page } = await http.get<PageResponse<Quarto>>('/api/quartos?size=200')
      setData(page)
    } catch (e) {
      setErr(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  function clearFilters() {
    setBusca('')
    setTipo('')
    setFaixa('')
    setFiltroAr(false)
    setFiltroHidro(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const filtrados = useMemo(() => {
    const list = data?.content ?? []
    const q = busca.trim().toLowerCase()
    return list.filter((row) => {
      if (!row.ativo) return false
      if (tipo && row.tipoQuarto !== tipo) return false
      if (filtroAr && !row.possuiArCondicionado) return false
      if (filtroHidro && !row.possuiHidromassagem) return false
      if (faixa) {
        const v = parseDiaria(row.valorBaseDiaria)
        if (faixa === 'ate150' && v >= 150) return false
        if (faixa === '150300' && (v < 150 || v >= 300)) return false
        if (faixa === 'acima300' && v < 300) return false
      }
      if (q) {
        const hay = `${row.residenciaEndereco} ${row.residenciaNumero} ${roomTypeLabel(row.tipoQuarto)}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [data, busca, tipo, faixa, filtroAr, filtroHidro])

  const temFiltroAvancado = Boolean(tipo || faixa || filtroAr || filtroHidro)
  const faixaLabel =
    faixa === 'ate150'
      ? 'Até R$ 150'
      : faixa === '150300'
        ? 'R$ 150 - R$ 300'
        : faixa === 'acima300'
          ? 'Acima de R$ 300'
          : ''

  return (
    <div className="page page--catalog">
      <PageHeader
        className="minimal"
        title="Explorar quartos"
        description="Compare opções por local, tipo, preço e comodidades - catálogo denso, leitura rápida."
        actions={
          authLoading && getToken() ? (
            <span className="muted small" style={{ alignSelf: 'center' }}>
              …
            </span>
          ) : user ? (
            <Link className="btn primary" to="/dashboard">
              Painel
            </Link>
          ) : undefined
        }
      />

      <div className="catalog-filter-bar">
        <div className="catalog-filter-bar__grow">
          <Field label="Buscar">
            <TextInput
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Bairro, endereço ou tipo"
              autoComplete="off"
            />
          </Field>
        </div>
        <div className="catalog-filter-bar__actions">
          <button
            type="button"
            className="filter-collapse"
            onClick={() => setFiltrosAvancadosAbertos((v) => !v)}
            aria-expanded={filtrosAvancadosAbertos}
          >
            {filtrosAvancadosAbertos ? 'Ocultar filtros' : 'Filtros avançados'}
          </button>
          <button type="button" className="link-quiet" onClick={clearFilters}>
            Limpar
          </button>
        </div>
      </div>

      {temFiltroAvancado && !filtrosAvancadosAbertos && (
        <div className="filter-advanced" style={{ marginBottom: '0.65rem', padding: '0.55rem 0.65rem' }}>
          <div className="row-between" style={{ alignItems: 'center', gap: '0.75rem' }}>
            <div className="filter-pill-row" style={{ flex: 1, minWidth: 0 }}>
              {tipo && (
                <span className="filter-pill is-on" style={{ cursor: 'default' }}>
                  {roomTypeLabel(tipo)}
                </span>
              )}
              {faixaLabel && (
                <span className="filter-pill is-on" style={{ cursor: 'default' }}>
                  {faixaLabel}
                </span>
              )}
              {filtroAr && (
                <span className="filter-pill is-on" style={{ cursor: 'default' }}>
                  Ar
                </span>
              )}
              {filtroHidro && (
                <span className="filter-pill is-on" style={{ cursor: 'default' }}>
                  Hidro
                </span>
              )}
            </div>
            <button type="button" className="filter-collapse" onClick={() => setFiltrosAvancadosAbertos(true)}>
              Editar
            </button>
          </div>
        </div>
      )}

      {filtrosAvancadosAbertos && (
        <div className="filter-advanced">
          <div className="filter-strip-inner filter-strip-inner--explore">
            <Field label="Tipo de quarto">
              <SelectInput value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Todos</option>
                <option value="INDIVIDUAL">Individual</option>
                <option value="CASAL">Casal</option>
                <option value="FAMILIA">Família</option>
              </SelectInput>
            </Field>
            <Field label="Faixa de diária">
              <SelectInput value={faixa} onChange={(e) => setFaixa(e.target.value as Faixa)}>
                <option value="">Todas</option>
                <option value="ate150">Até R$ 150</option>
                <option value="150300">R$ 150 - R$ 300</option>
                <option value="acima300">Acima de R$ 300</option>
              </SelectInput>
            </Field>
            <div className="field full" style={{ gridColumn: '1 / -1' }}>
              <span className="field-label">Comodidades</span>
              <div className="filter-pill-row" style={{ marginTop: '0.35rem' }}>
                <button type="button" className={`filter-pill${filtroAr ? ' is-on' : ''}`} onClick={() => setFiltroAr((v) => !v)}>
                  Ar condicionado
                </button>
                <button type="button" className={`filter-pill${filtroHidro ? ' is-on' : ''}`} onClick={() => setFiltroHidro((v) => !v)}>
                  Hidromassagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {err && (
        <InlineNotice tone="danger" title="Erro">
          {err}
        </InlineNotice>
      )}

      {!loading && (
        <p className="catalog-results-meta">
          <span>
            <strong className="mono" style={{ color: 'var(--text)' }}>
              {filtrados.length}
            </strong>{' '}
            {filtrados.length === 1 ? 'quarto disponível' : 'quartos disponíveis'}
          </span>
          <span className="muted">Catálogo em tempo real</span>
        </p>
      )}

      {loading ? (
        <div className="catalog-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filtrados.length > 0 ? (
        <div className="catalog-grid">
          {filtrados.map((q) => (
            <article key={q.id} className="room-card catalog-mock">
              <Link to={`/explorar/${q.id}`} className="room-card-visual room-card-visual--link">
                <RoomVisual quarto={q} compact />
                <span className="room-card-overlay-cap">{quartoCapLine(q)}</span>
                <span className="room-card-price-pill">
                  {formatMoney(q.valorBaseDiaria)}
                  <span className="room-card-price-suffix"> /noite</span>
                </span>
              </Link>
              <div className="room-card-body-mock">
                <p className="room-card-loc">{quartoBairroLinha(q)}</p>
                <h3>{roomTypeLabel(q.tipoQuarto)}</h3>
                <div className="room-card-tag-row" aria-label="Comodidades">
                  <span className={`room-card-tag${q.possuiArCondicionado ? ' is-on' : ''}`}>Ar</span>
                  <span className={`room-card-tag${q.possuiHidromassagem ? ' is-on' : ''}`}>Hidro</span>
                </div>
                <div className="room-card-cta">
                  <Link className="btn secondary" to={`/explorar/${q.id}`}>
                    Ver detalhes e reservar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum resultado"
          description="Ajuste a busca ou os filtros para ver mais quartos."
          action={
            <Button type="button" variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
        />
      )}
    </div>
  )
}
