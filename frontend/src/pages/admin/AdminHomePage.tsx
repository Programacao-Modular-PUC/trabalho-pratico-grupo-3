import { motion } from 'framer-motion'
import { ArrowRight, BedDouble, CalendarClock, FileText, LineChart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoMark } from '@/components/brand/LogoMark'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import {
  formatCurrency,
  getClientById,
  getRoomById,
  reservations,
  rooms,
} from '@/data/mockData'

const sections = [
  {
    title: 'Gerencie hospedagens com simplicidade',
    body: 'Cadastre residências, organize quartos e acompanhe o fluxo operacional com uma interface executiva.',
  },
  {
    title: 'Consulte quartos disponíveis',
    body: 'Veja tipos, adicionais e status em tempo real — preparado para refletir disponibilidade por período.',
  },
  {
    title: 'Acompanhe reservas e aluguéis',
    body: 'Da reserva futura ao aluguel em andamento: tudo com narrativa visual coerente com as regras do domínio.',
  },
  {
    title: 'Visualize histórico e recibos',
    body: 'Histórico auditável e recibos com layout premium, prontos para emissão quando o backend estiver ativo.',
  },
]

export function AdminHomePage() {
  const { user } = useAuth()
  const popular = rooms.slice(0, 3)
  const recent = reservations.slice(0, 3)

  return (
    <div className="space-y-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-nanb-950 to-nanb-950 p-8 sm:p-10"
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/[0.06] blur-3xl" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-4">
              <LogoMark size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-nanb-500">Bem-vindo(a)</p>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Olá, {user?.name.split(' ')[0]}
                </h1>
              </div>
            </div>
            <p className="mt-4 text-pretty text-sm leading-relaxed text-nanb-400">
              Esta é a página inicial interna do NoAirNoBnB — visão institucional do produto, atalhos rápidos e um
              panorama do que o sistema permite construir.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/admin/dashboard">
                <Button className="gap-2">
                  Ir para o painel <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/admin/rooms">
                <Button variant="secondary" type="button">
                  Ver quartos
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-nanb-950/40 p-4">
              <LineChart className="h-5 w-5 text-nanb-300" />
              <p className="mt-3 text-2xl font-semibold text-white">+18%</p>
              <p className="text-xs text-nanb-500">Ocupação simulada (mês)</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-nanb-950/40 p-4">
              <CalendarClock className="h-5 w-5 text-nanb-300" />
              <p className="mt-3 text-2xl font-semibold text-white">24</p>
              <p className="text-xs text-nanb-500">Reservas ativas (mock)</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map((s, i) => (
          <ScrollReveal key={s.title} delay={i * 0.05}>
            <div className="h-full rounded-2xl border border-white/10 bg-nanb-900/30 p-6">
              <h2 className="font-display text-lg font-semibold text-white">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-nanb-400">{s.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ScrollReveal>
          <div className="rounded-2xl border border-white/10 bg-nanb-900/30 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-white">Quartos em destaque</h3>
              <Link to="/admin/rooms" className="text-xs text-nanb-400 hover:text-white">
                Ver todos
              </Link>
            </div>
            <div className="space-y-3">
              {popular.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{r.label}</p>
                    <p className="text-xs text-nanb-500">{r.type === 'casal' ? 'Casal' : 'Individual'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatCurrency(r.finalDaily)}</p>
                    <p className="text-[11px] text-nanb-500">/ noite</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="rounded-2xl border border-white/10 bg-nanb-900/30 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-white">Reservas recentes</h3>
              <Link to="/admin/reservations" className="text-xs text-nanb-400 hover:text-white">
                Abrir reservas
              </Link>
            </div>
            <div className="space-y-3">
              {recent.map((rv) => {
                const c = getClientById(rv.clientId)
                const q = getRoomById(rv.roomId)
                return (
                  <div
                    key={rv.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{c?.name}</p>
                        <p className="text-xs text-nanb-500">{q?.label}</p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-white">{formatCurrency(rv.estimatedValue)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal>
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.05] to-transparent px-6 py-6 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-nanb-950">
              <BedDouble className="h-5 w-5 text-nanb-200" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-white">Pronto para a próxima sprint</p>
              <p className="mt-1 max-w-xl text-sm text-nanb-400">
                O front está organizado para receber integrações: entidades coerentes, telas completas e componentes
                reutilizáveis.
              </p>
            </div>
          </div>
          <Link to="/admin/reservations">
            <Button variant="secondary" className="gap-2">
              Criar fluxo de reserva <FileText className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </ScrollReveal>
    </div>
  )
}
