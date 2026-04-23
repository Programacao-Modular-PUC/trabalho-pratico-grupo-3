import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  CalendarDays,
  ClipboardList,
  History,
  Home,
  LayoutDashboard,
  MapPin,
  Receipt,
  Users,
  DoorOpen,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { LogoMark } from '@/components/brand/LogoMark'
import { cn } from '@/lib/utils'

const links = [
  { to: '/admin', label: 'Início', icon: Home, end: true },
  { to: '/admin/dashboard', label: 'Painel', icon: LayoutDashboard },
  { to: '/admin/residences', label: 'Residências', icon: Building2 },
  { to: '/admin/rooms', label: 'Quartos', icon: DoorOpen },
  { to: '/admin/clients', label: 'Clientes', icon: Users },
  { to: '/admin/reservations', label: 'Reservas', icon: CalendarDays },
  { to: '/admin/rentals', label: 'Aluguéis', icon: ClipboardList },
  { to: '/admin/availability', label: 'Disponibilidade', icon: MapPin },
  { to: '/admin/receipts', label: 'Recibos', icon: Receipt },
  { to: '/admin/history', label: 'Histórico', icon: History },
]

export function AdminSidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const content = (
    <div className="flex h-full flex-col border-r border-white/10 bg-nanb-950/95 px-3 py-6 backdrop-blur-xl">
      <div className="mb-8 flex items-center gap-3 px-2">
        <LogoMark size="sm" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold tracking-tight text-white">NoAirNoBnB</p>
          <p className="text-[11px] text-nanb-500">Área administrativa</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1" aria-label="Principal">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => onClose()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-white text-nanb-950 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset]'
                  : 'text-nanb-300 hover:bg-white/[0.06] hover:text-white',
              )
            }
          >
            <l.icon className="h-4 w-4 shrink-0 opacity-90" />
            <span className="truncate">{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-nanb-500">
        Versão de interface — dados fictícios para demonstração.
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">{content}</aside>
      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Fechar menu"
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
