import type { Quarto, QuartoImagemRef } from '../api/types'
import { roomTypeLabel } from '../utils/format'
import { IconAr, IconBedCasal, IconBedSingle, IconHidro } from './RoomIcons'

type QuartoVisual = Pick<Quarto, 'id' | 'tipoQuarto' | 'possuiArCondicionado' | 'possuiHidromassagem'> & {
  imagens?: QuartoImagemRef[]
}

export function RoomVisual({
  quarto,
  compact,
  coverUrl,
}: {
  quarto: QuartoVisual
  compact?: boolean
  /** Se definido, substitui a primeira imagem da lista (ex.: galeria no detalhe). */
  coverUrl?: string | null
}) {
  const isCasal = quarto.tipoQuarto === 'CASAL'
  const capa = (coverUrl?.trim() || quarto.imagens?.[0]?.url) ?? ''

  if (capa.length > 0) {
    return (
      <div
        className={`room-visual room-visual--photo${isCasal ? ' casal' : ' individual'}${compact ? ' compact' : ''}`}
      >
        <img src={capa} alt="" className="room-visual-photo" loading="lazy" />
      </div>
    )
  }

  return (
    <div className={`room-visual${isCasal ? ' casal' : ' individual'}${compact ? ' compact' : ''}`}>
      <div className="room-visual-inner">
        <div className="room-visual-type-icon" aria-hidden>
          {isCasal ? <IconBedCasal /> : <IconBedSingle />}
        </div>
        <div className="room-visual-panel">
          <span className="room-visual-code">Quarto {String(quarto.id).padStart(2, '0')}</span>
          <strong>{roomTypeLabel(quarto.tipoQuarto)}</strong>
          <div className="room-visual-tags">
            <span className={`room-visual-icon-tag${quarto.possuiArCondicionado ? '' : ' is-off'}`} title="Ar-condicionado">
              <IconAr />
            </span>
            <span className={`room-visual-icon-tag${quarto.possuiHidromassagem ? '' : ' is-off'}`} title="Hidromassagem">
              <IconHidro />
            </span>
            {!quarto.possuiArCondicionado && !quarto.possuiHidromassagem && <span className="room-visual-fallback">Essencial</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
