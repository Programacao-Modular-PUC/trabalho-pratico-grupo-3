import { motion } from 'framer-motion'
import { ChevronRight, Coffee, Snowflake, Sparkles, User, Wifi } from 'lucide-react'
import { formatCurrency } from '@/data/mockData'
import type { Room } from '@/types'
import { cn } from '@/lib/utils'

export function ExploreRoomCard({
  room,
  locationLine,
  onOpen,
  delay = 0,
}: {
  room: Room
  locationLine: string
  onOpen: () => void
  delay?: number
}) {
  const cover = room.images[0]

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-nanb-900/40',
        'transition-all duration-300 hover:border-white/20 hover:shadow-[0_24px_48px_-24px_rgba(0,0,0,0.8)]',
        'hover:-translate-y-0.5',
      )}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-nanb-800">
        <img
          src={cover}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-wider text-white/80">{locationLine}</p>
          <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black">
            {formatCurrency(room.finalDaily)}
            <span className="font-normal text-black/50"> /noite</span>
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-white">{room.label}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-nanb-400">{room.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-nanb-300">
            <User className="h-3 w-3" />
            {room.type === 'casal' ? 'Casal' : 'Individual'}
          </span>
          {room.hasAc ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-nanb-300">
              <Snowflake className="h-3 w-3" /> Ar
            </span>
          ) : null}
          {room.hasJacuzzi ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-nanb-300">
              <Sparkles className="h-3 w-3" /> Hidro
            </span>
          ) : null}
          {room.hasWifi ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-nanb-300">
              <Wifi className="h-3 w-3" /> Wi-Fi
            </span>
          ) : null}
          {room.hasBreakfast ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-nanb-300">
              <Coffee className="h-3 w-3" /> Café
            </span>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4 text-sm font-medium text-white">
          <span className="text-nanb-500">Ver detalhes</span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.article>
  )
}
