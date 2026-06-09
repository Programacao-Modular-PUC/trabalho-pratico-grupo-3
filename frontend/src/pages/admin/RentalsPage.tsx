import { FileText, MoreHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { statusBadgeProps } from '@/lib/statusBadges'
import { Button } from '@/components/ui/Button'
import { DataCell, DataRow, DataTable } from '@/components/ui/DataTable'
import { Select } from '@/components/ui/Select'
import {
  formatCurrency,
  formatDateTime,
  getClientById,
  getResidenceById,
  getRoomById,
  rentals,
} from '@/data/mockData'

export function RentalsPage() {
  const [pay, setPay] = useState('todos')

  const filtered = useMemo(() => rentals.filter((r) => pay === 'todos' || r.paymentStatus === pay), [pay])

  const active = filtered.filter((r) => r.active)
  const done = filtered.filter((r) => !r.active)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Aluguéis / Hospedagens</h1>
        <p className="mt-2 text-sm text-nanb-400">Aluguéis e pagamentos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select label="Status do pagamento" value={pay} onChange={(e) => setPay(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="parcial">Parcial</option>
          <option value="pago">Pago</option>
          <option value="estornado">Estornado</option>
        </Select>
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-4 md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-nanb-500">Resumo financeiro (mock)</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-nanb-500">Total registrado</p>
              <p className="font-display text-2xl font-semibold text-white">
                {formatCurrency(filtered.reduce((a, r) => a + r.total, 0))}
              </p>
            </div>
            <div className="text-right text-xs text-nanb-500">
              Inclui diárias calculadas por período de hospedagem
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-white">Hospedagens ativas</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {active.length ? (
            active.map((r) => {
              const c = getClientById(r.clientId)
              const q = getRoomById(r.roomId)
              const res = getResidenceById(r.residenceId)
              const ps = statusBadgeProps(r.paymentStatus)
              return (
                <div key={r.id} className="rounded-2xl border border-white/10 bg-nanb-900/40 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-nanb-500">{res?.address}</p>
                      <p className="mt-1 font-display text-lg font-semibold text-white">{c?.name}</p>
                      <p className="text-sm text-nanb-400">{q?.label}</p>
                    </div>
                    <Badge tone={ps.tone}>{ps.label}</Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[11px] text-nanb-500">Entrada</dt>
                      <dd className="text-nanb-200">{formatDateTime(r.checkIn)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-nanb-500">Saída</dt>
                      <dd className="text-nanb-200">{formatDateTime(r.checkOut)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-nanb-500">Diárias</dt>
                      <dd className="text-white">{r.nights}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-nanb-500">Total</dt>
                      <dd className="font-semibold text-white">{formatCurrency(r.total)}</dd>
                    </div>
                  </dl>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button size="sm" type="button">
                      Finalizar
                    </Button>
                    <Button size="sm" variant="secondary" type="button" className="gap-2">
                      <FileText className="h-4 w-4" /> Emitir recibo
                    </Button>
                    <Button size="sm" variant="ghost" type="button" className="gap-2">
                      <MoreHorizontal className="h-4 w-4" /> Detalhes
                    </Button>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-nanb-500">Nenhuma hospedagem ativa com esse filtro.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-white">Encerradas</h2>
        <DataTable
          columns={[
            { key: 'c', label: 'Cliente' },
            { key: 'q', label: 'Quarto' },
            { key: 'n', label: 'Diárias', align: 'right' },
            { key: 't', label: 'Total', align: 'right' },
            { key: 'p', label: 'Pagamento' },
          ]}
        >
          {done.map((r) => {
            const c = getClientById(r.clientId)
            const q = getRoomById(r.roomId)
            const ps = statusBadgeProps(r.paymentStatus)
            return (
              <DataRow key={r.id}>
                <DataCell>{c?.name}</DataCell>
                <DataCell>{q?.label}</DataCell>
                <DataCell align="right">{r.nights}</DataCell>
                <DataCell align="right">{formatCurrency(r.total)}</DataCell>
                <DataCell>
                  <Badge tone={ps.tone}>{ps.label}</Badge>
                </DataCell>
              </DataRow>
            )
          })}
        </DataTable>
      </section>
    </div>
  )
}
