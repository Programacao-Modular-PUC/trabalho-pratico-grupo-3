import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Coffee, Snowflake, Sparkles, User, Wifi, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, getResidenceById } from '@/data/mockData'
import type { Room } from '@/types'
import { cn } from '@/lib/utils'

export function RoomDetailModal({
  room,
  open,
  onClose,
}: {
  room: Room | null
  open: boolean
  onClose: () => void
}) {
  const [idx, setIdx] = useState(0)

  const images = room?.images ?? []
  const total = images.length

  const next = useCallback(() => {
    setIdx((i) => (total ? (i + 1) % total : 0))
  }, [total])

  const prev = useCallback(() => {
    setIdx((i) => (total ? (i - 1 + total) % total : 0))
  }, [total])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, next, prev])

  if (!room) return null

  const res = getResidenceById(room.residenceId)
  const location = res ? `${res.address}, ${res.number} — ${res.neighborhood}` : '—'

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            aria-label="Fechar"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="room-detail-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="relative z-10 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-nanb-950 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.9)] lg:max-h-[85vh] lg:flex-row"
          >
            {/* Galeria */}
            <div className="relative flex min-h-[220px] flex-1 bg-black lg:min-h-0 lg:max-w-[52%]">
              <img
                src={images[idx]}
                alt=""
                className="h-full min-h-[240px] w-full object-cover lg:min-h-[420px]"
              />
              {total > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      prev()
                    }}
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Imagem anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      next()
                    }}
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                    aria-label="Próxima imagem"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Foto ${i + 1}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setIdx(i)
                        }}
                        className={cn(
                          'h-1.5 rounded-full transition-all',
                          i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/55',
                        )}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            {/* Conteúdo */}
            <div className="flex max-h-[50vh] flex-1 flex-col overflow-y-auto lg:max-h-none">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5 sm:p-6">
                <div className="min-w-0">
                  <p className="text-xs text-nanb-500">{location}</p>
                  <h2 id="room-detail-title" className="mt-1 font-display text-2xl font-semibold tracking-tight text-white">
                    {room.label}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-nanb-300 transition-colors hover:border-white/20 hover:text-white"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-6 p-5 sm:p-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-nanb-500">A partir de</p>
                  <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-white">
                    {formatCurrency(room.finalDaily)}
                    <span className="text-lg font-normal text-nanb-500"> /noite</span>
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-nanb-300">{room.fullDescription}</p>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-nanb-500">Comodidades</p>
                  <ul className="mt-3 space-y-2 text-sm text-nanb-200">
                    <li className="flex items-center gap-2">
                      <Snowflake className="h-4 w-4 text-nanb-400" />
                      Ar condicionado: {room.hasAc ? 'Sim' : 'Não'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-nanb-400" />
                      Hidromassagem: {room.hasJacuzzi ? 'Sim' : 'Não'}
                    </li>
                    <li className="flex items-center gap-2">
                      <User className="h-4 w-4 text-nanb-400" />
                      Tipo: {room.type === 'casal' ? 'Quarto casal' : 'Individual'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-nanb-400" />
                      Wi-Fi: {room.hasWifi ? 'Incluído' : 'Não disponível'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 text-nanb-400" />
                      Café da manhã: {room.hasBreakfast ? 'Incluído' : 'Não incluso'}
                    </li>
                  </ul>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-nanb-400" />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-nanb-500">Disponibilidade</p>
                    <p className="mt-1 text-sm text-nanb-300">{room.availabilityNote ?? 'Consulte períodos na confirmação.'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 p-5 sm:p-6">
                <Button type="button" size="lg" className="w-full text-base" onClick={onClose}>
                  Reservar agora
                </Button>
                <p className="mt-3 text-center text-[11px] text-nanb-600">Ação visual — integração com reserva na próxima etapa.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
