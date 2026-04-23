import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BedDouble,
  Building2,
  CalendarCheck,
  CircleDollarSign,
  DoorOpen,
  Moon,
  TrendingUp,
  Users,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { DataCell, DataRow, DataTable } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { statusBadgeProps } from '@/lib/statusBadges'
import { formatCurrency, formatDateTime, getClientById, getRoomById, rentals, reservations, residences, rooms } from '@/data/mockData'

const chartData = [
  { m: 'Jan', v: 128 },
  { m: 'Fev', v: 142 },
  { m: 'Mar', v: 156 },
  { m: 'Abr', v: 168 },
  { m: 'Mai', v: 175 },
  { m: 'Jun', v: 182 },
]

export function AdminDashboardPage() {
  const totalResidences = residences.length
  const totalRooms = rooms.length
  const available = rooms.filter((r) => r.status === 'disponivel').length
  const occupied = rooms.filter((r) => r.status === 'ocupado').length
  const activeReservations = reservations.filter((r) => r.status !== 'cancelada').length
  const activeRentals = rentals.filter((r) => r.active).length
  const revenue = rentals.reduce((acc, r) => acc + r.total, 0)

  const recent = rentals.slice(0, 4)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Painel administrativo</h1>
        <p className="mt-2 max-w-2xl text-sm text-nanb-400">
          Indicadores simulados com aparência realista — prontos para substituição por dados da API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Residências" value={String(totalResidences)} icon={Building2} delay={0} />
        <StatCard label="Quartos" value={String(totalRooms)} icon={DoorOpen} delay={0.04} />
        <StatCard label="Disponíveis" value={String(available)} icon={BedDouble} delay={0.08} />
        <StatCard label="Ocupados" value={String(occupied)} icon={Moon} delay={0.12} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Reservas ativas"
          value={String(activeReservations)}
          icon={CalendarCheck}
          delay={0.05}
        />
        <StatCard label="Aluguéis em andamento" value={String(activeRentals)} icon={Users} delay={0.09} />
        <StatCard
          label="Receita estimada (mock)"
          value={formatCurrency(revenue)}
          hint="Soma dos registros de aluguel"
          icon={CircleDollarSign}
          delay={0.13}
        />
        <StatCard label="Tendência" value="+6,2%" hint="Simulado" icon={TrendingUp} delay={0.17} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-nanb-900/30 p-5 lg:col-span-3">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-nanb-500">Ocupação</p>
              <p className="mt-1 font-display text-lg font-semibold text-white">Série mensal (demonstração)</p>
            </div>
            <p className="text-xs text-nanb-500">Monocromático por design</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="m" stroke="#737373" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#737373" tick={{ fill: '#a3a3a3', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0a0a0a',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12,
                    color: '#fafafa',
                  }}
                  labelStyle={{ color: '#a3a3a3' }}
                />
                <Area type="monotone" dataKey="v" stroke="#ffffff" strokeWidth={2} fill="url(#fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-nanb-900/30 p-5 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-nanb-500">Resumo executivo</p>
          <p className="mt-2 font-display text-lg font-semibold text-white">Operação estável</p>
          <ul className="mt-4 space-y-3 text-sm text-nanb-300">
            <li className="flex justify-between gap-3 border-b border-white/10 pb-3">
              <span className="text-nanb-500">Quartos reservados</span>
              <span className="text-white">{rooms.filter((r) => r.status === 'reservado').length}</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-white/10 pb-3">
              <span className="text-nanb-500">Reservas pendentes</span>
              <span className="text-white">{reservations.filter((r) => r.status === 'pendente').length}</span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-nanb-500">Ticket médio (mock)</span>
              <span className="text-white">{formatCurrency(revenue / Math.max(rentals.length, 1))}</span>
            </li>
          </ul>
        </div>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-white">Histórico recente</h2>
            <p className="text-sm text-nanb-500">Aluguéis com cliente, quarto e pagamento</p>
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'c', label: 'Cliente' },
            { key: 'q', label: 'Quarto' },
            { key: 'p', label: 'Período' },
            { key: 't', label: 'Total', align: 'right' },
            { key: 's', label: 'Pagamento' },
          ]}
        >
          {recent.map((r) => {
            const c = getClientById(r.clientId)
            const q = getRoomById(r.roomId)
            const pay = statusBadgeProps(r.paymentStatus)
            return (
              <DataRow key={r.id}>
                <DataCell>{c?.name}</DataCell>
                <DataCell>{q?.label}</DataCell>
                <DataCell className="text-nanb-400">
                  {formatDateTime(r.checkIn)} → {formatDateTime(r.checkOut)}
                </DataCell>
                <DataCell align="right">{formatCurrency(r.total)}</DataCell>
                <DataCell>
                  <Badge tone={pay.tone}>{pay.label}</Badge>
                </DataCell>
              </DataRow>
            )
          })}
        </DataTable>
      </div>
    </div>
  )
}
