import { CalendarDays, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { statusBadgeProps } from '@/lib/statusBadges'
import { Button } from '@/components/ui/Button'
import { DataCell, DataRow, DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import {
  clients,
  formatCurrency,
  formatDateTime,
  getClientById,
  getResidenceById,
  getRoomById,
  reservations,
  rooms,
} from '@/data/mockData'

export function ReservationsPage() {
  const [status, setStatus] = useState('todos')
  const [cliente, setCliente] = useState('todos')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      const s = status === 'todos' || r.status === status
      const c = cliente === 'todos' || r.clientId === cliente
      return s && c
    })
  }, [status, cliente])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Reservas</h1>
          <p className="mt-2 text-sm text-nanb-400">
            Reserva futura com entrada/saída — base para cálculo de diárias e confirmação.
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nova reserva
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="confirmada">Confirmada</option>
          <option value="cancelada">Cancelada</option>
          <option value="concluida">Concluída</option>
        </Select>
        <Select label="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)}>
          <option value="todos">Todos</option>
          {Array.from(new Set(reservations.map((r) => r.clientId))).map((id) => {
            const c = getClientById(id)
            return (
              <option key={id} value={id}>
                {c?.name}
              </option>
            )
          })}
        </Select>
        <div className="rounded-2xl border border-white/10 bg-nanb-900/30 p-4">
          <div className="flex items-center gap-2 text-xs text-nanb-500">
            <CalendarDays className="h-4 w-4" />
            Calendário estilizado (demonstração)
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-nanb-500">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={`${d}-${i}`} className="py-1">
                {d}
              </span>
            ))}
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className={`rounded-lg py-2 ${i === 10 || i === 11 ? 'bg-white text-nanb-950' : 'bg-white/[0.03] text-nanb-300'}`}
              >
                {i + 1}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-nanb-600">Seleção visual — integração com datas virá na API.</p>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'cl', label: 'Cliente' },
          { key: 'res', label: 'Residência' },
          { key: 'q', label: 'Quarto' },
          { key: 'in', label: 'Entrada' },
          { key: 'out', label: 'Saída' },
          { key: 'st', label: 'Status' },
          { key: 'v', label: 'Valor estimado', align: 'right' },
        ]}
      >
        {filtered.map((r) => {
          const c = getClientById(r.clientId)
          const res = getResidenceById(r.residenceId)
          const q = getRoomById(r.roomId)
          const st = statusBadgeProps(r.status)
          return (
            <DataRow key={r.id}>
              <DataCell>{c?.name}</DataCell>
              <DataCell className="max-w-[200px] truncate">{res?.address}</DataCell>
              <DataCell>{q?.label}</DataCell>
              <DataCell className="text-nanb-400">{formatDateTime(r.checkIn)}</DataCell>
              <DataCell className="text-nanb-400">{formatDateTime(r.checkOut)}</DataCell>
              <DataCell>
                <Badge tone={st.tone}>{st.label}</Badge>
              </DataCell>
              <DataCell align="right">{formatCurrency(r.estimatedValue)}</DataCell>
            </DataRow>
          )
        })}
      </DataTable>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova reserva (visual)"
        size="lg"
        footer={<Button onClick={() => setOpen(false)}>Criar (mock)</Button>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Cliente">
            <option>Selecione…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select label="Quarto">
            <option>Selecione…</option>
            {rooms.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label}
              </option>
            ))}
          </Select>
          <Input label="Entrada" type="datetime-local" />
          <Input label="Saída" type="datetime-local" />
          <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-nanb-400">
            O valor estimado considera diárias entre entrada e saída, com adicionais do quarto — simulado nesta sprint.
          </div>
        </div>
      </Modal>
    </div>
  )
}
