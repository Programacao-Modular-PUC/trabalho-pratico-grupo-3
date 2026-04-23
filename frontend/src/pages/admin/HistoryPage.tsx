import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { statusBadgeProps } from '@/lib/statusBadges'
import { DataCell, DataRow, DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { historyEntries } from '@/data/mockData'

export function HistoryPage() {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('todos')

  const filtered = useMemo(() => {
    return historyEntries.filter((h) => {
      const match = `${h.refName} ${h.notes ?? ''}`.toLowerCase().includes(q.toLowerCase())
      const s = status === 'todos' || h.status === status
      return match && s
    })
  }, [q, status])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Histórico</h1>
        <p className="mt-2 text-sm text-nanb-400">
          Movimentações por cliente ou quarto — filtros preparados para datas reais.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input label="Pesquisar" placeholder="Nome, notas…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label="Status final" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
          <option value="concluido">Concluído</option>
        </Select>
        <Input label="Período (visual)" type="month" />
      </div>

      <DataTable
        columns={[
          { key: 'sc', label: 'Escopo' },
          { key: 'ref', label: 'Referência' },
          { key: 'per', label: 'Período' },
          { key: 'st', label: 'Status' },
          { key: 'no', label: 'Notas' },
        ]}
      >
        {filtered.map((h) => {
          const st = statusBadgeProps(h.status)
          return (
            <DataRow key={h.id}>
              <DataCell className="capitalize text-nanb-300">{h.scope}</DataCell>
              <DataCell className="font-medium text-white">{h.refName}</DataCell>
              <DataCell className="text-nanb-400">{h.period}</DataCell>
              <DataCell>
                <Badge tone={st.tone}>{st.label}</Badge>
              </DataCell>
              <DataCell className="max-w-[360px] text-nanb-500">{h.notes ?? '—'}</DataCell>
            </DataRow>
          )
        })}
      </DataTable>
    </div>
  )
}
