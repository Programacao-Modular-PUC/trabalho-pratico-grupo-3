import { motion } from 'framer-motion'
import { Coffee, Snowflake, Sparkles, Wifi } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { statusBadgeProps } from '@/lib/statusBadges'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/data/mockData'
import type { Room } from '@/types'
import { cn } from '@/lib/utils'

/** Cartão compacto (ex.: áreas administrativas) — versão lista com imagem opcional */
export function RoomCard({
  room,
  residenceLabel,
  onReserve,
  delay = 0,
}: {
  room: Room
  residenceLabel: string
  onReserve?: () => void
  delay?: number
}) {
  const st = statusBadgeProps(room.status)
  const cover = room.images[0]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-nanb-900/50',
        'transition-all duration-300 hover:border-white/20',
      )}
    >
      {cover ? (
        <div className="aspect-[16/9] overflow-hidden bg-nanb-800">
          <img src={cover} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-nanb-500">{residenceLabel}</p>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-tight text-white">{room.label}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-nanb-400">{room.summary}</p>
          </div>
          <Badge tone={st.tone}>{st.label}</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {room.hasAc ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-nanb-300">
              <Snowflake className="h-3 w-3" /> Ar
            </span>
          ) : null}
          {room.hasJacuzzi ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-nanb-300">
              <Sparkles className="h-3 w-3" /> Hidro
            </span>
          ) : null}
          {room.hasWifi ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-nanb-300">
              <Wifi className="h-3 w-3" /> Wi-Fi
            </span>
          ) : null}
          {room.hasBreakfast ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-nanb-300">
              <Coffee className="h-3 w-3" /> Café
            </span>
          ) : null}
        </div>
        <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-nanb-500">Diária</p>
            <p className="font-display text-xl font-semibold text-white">{formatCurrency(room.finalDaily)}</p>
          </div>
          {onReserve ? (
            <Button size="sm" type="button" onClick={onReserve}>
              Reservar
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
