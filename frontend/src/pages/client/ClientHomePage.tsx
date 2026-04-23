import { motion } from 'framer-motion'
import { ArrowRight, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { statusBadgeProps } from '@/lib/statusBadges'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatCurrency,
  formatDateShort,
  formatDateTime,
  getResidenceById,
  getRoomById,
  reservations,
} from '@/data/mockData'

export function ClientHomePage() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0] ?? '—'

  const mine = reservations.filter((r) => r.clientId === 'c1')
  const upcoming = mine
    .filter((r) => new Date(r.checkIn) > new Date())
    .sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime())
  const next = upcoming[0]

  const room = next ? getRoomById(next.roomId) : null
  const res = next ? getResidenceById(next.residenceId) : null
  const st = next ? statusBadgeProps(next.status) : null

  return (
    <div className="mx-auto max-w-3xl space-y-16 pb-8">
      {/* Hero + próxima reserva */}
      <section className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Bem-vindo de volta, {firstName}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 sm:p-10"
        >
          <div className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-nanb-500">
            <Calendar className="h-4 w-4" />
            Sua próxima reserva
          </div>

          {next && room && res && st ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl font-semibold text-white sm:text-2xl">{room.label}</p>
                  <p className="mt-2 text-sm text-nanb-400">
                    {res.address}, {res.number} — {res.neighborhood}
                  </p>
                </div>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>

              <div className="grid gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-nanb-500">Datas</p>
                  <p className="mt-1 text-sm text-nanb-200">
                    {formatDateShort(next.checkIn)} → {formatDateShort(next.checkOut)}
                  </p>
                  <p className="mt-1 text-xs text-nanb-600">
                    {formatDateTime(next.checkIn).split(',')[1]?.trim()} —{' '}
                    {formatDateTime(next.checkOut).split(',')[1]?.trim()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-nanb-500">Valor estimado</p>
                  <p className="mt-1 font-display text-xl font-semibold text-white">{formatCurrency(next.estimatedValue)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-nanb-400">Nenhuma reserva futura no momento.</p>
              <Link to="/client/explore" className="mt-4 inline-block text-sm font-medium text-white underline-offset-4 hover:underline">
                Explorar quartos
              </Link>
            </div>
          )}
        </motion.div>
      </section>

      {/* Exploração */}
      <section className="space-y-6 text-center">
        <h2 className="font-display text-xl font-semibold tracking-tight text-white sm:text-2xl">
          Explore novos lugares e encontre sua próxima estadia
        </h2>
        <Link to="/client/explore">
          <Button size="lg" className="rounded-full px-8">
            Explorar quartos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}
