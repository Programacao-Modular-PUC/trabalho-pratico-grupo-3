import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { statusBadgeProps } from '@/lib/statusBadges'
import { Select } from '@/components/ui/Select'
import { getResidenceById, rooms } from '@/data/mockData'
import type { RoomStatus } from '@/types'
import { cn } from '@/lib/utils'

const days = Array.from({ length: 14 }).map((_, i) => i + 1)

const matrix: Record<string, RoomStatus[]> = {
  q1: ['disponivel', 'disponivel', 'reservado', 'reservado', 'ocupado', 'ocupado', 'disponivel', 'disponivel', 'disponivel', 'reservado', 'disponivel', 'disponivel', 'disponivel', 'disponivel'],
  q2: ['reservado', 'reservado', 'reservado', 'ocupado', 'ocupado', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'reservado', 'reservado', 'disponivel'],
  q3: ['ocupado', 'ocupado', 'ocupado', 'disponivel', 'disponivel', 'disponivel', 'reservado', 'reservado', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel'],
  q4: ['disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel'],
  q5: ['disponivel', 'reservado', 'reservado', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'ocupado', 'ocupado', 'disponivel', 'disponivel', 'disponivel', 'disponivel'],
  q6: ['reservado', 'reservado', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'disponivel', 'reservado', 'reservado'],
}

function Cell({ status }: { status: RoomStatus }) {
  const st = statusBadgeProps(status)
  const bg =
    status === 'disponivel'
      ? 'bg-white/[0.06]'
      : status === 'reservado'
        ? 'bg-white/[0.12]'
        : 'bg-white/[0.18]'
  return (
    <div className={cn('h-8 rounded-md border border-white/10', bg)} title={st.label}>
      <span className="sr-only">{st.label}</span>
    </div>
  )
}

export function AvailabilityPage() {
  const [residence, setResidence] = useState('todos')
  const [tipo, setTipo] = useState('todos')

  const list = useMemo(() => {
    return rooms.filter((r) => {
      const rr = residence === 'todos' || r.residenceId === residence
      const t = tipo === 'todos' || r.type === tipo
      return rr && t
    })
  }, [residence, tipo])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Disponibilidade</h1>
        <p className="mt-2 text-sm text-nanb-400">
          Grade demonstrativa por quarto e dia — legenda imediata para leitura rápida.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select label="Residência" value={residence} onChange={(e) => setResidence(e.target.value)}>
          <option value="todos">Todas</option>
          <option value="r1">Savassi</option>
          <option value="r2">Copacabana</option>
          <option value="r3">Jardins</option>
        </Select>
        <Select label="Tipo de quarto" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="individual">Individual</option>
          <option value="casal">Casal</option>
        </Select>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-nanb-500">Dados ilustrativos — ocupação por período virá da API.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-nanb-900/30 p-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-nanb-500">Legenda</span>
        {(['disponivel', 'reservado', 'ocupado'] as const).map((k) => {
          const st = statusBadgeProps(k)
          return (
            <Badge key={k} tone={st.tone}>
              {st.label}
            </Badge>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-nanb-900/30">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              <th className="sticky left-0 z-10 bg-nanb-950 px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-nanb-400">
                Quarto
              </th>
              {days.map((d) => (
                <th key={d} className="px-2 py-3 text-center text-[11px] font-semibold text-nanb-500">
                  D{d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {list.map((r) => {
              const res = getResidenceById(r.residenceId)
              const row = matrix[r.id] ?? matrix.q1
              return (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="sticky left-0 z-10 bg-nanb-950 px-4 py-3">
                    <p className="font-medium text-white">{r.label}</p>
                    <p className="text-xs text-nanb-500">{res?.neighborhood}</p>
                  </td>
                  {row.map((s, i) => (
                    <td key={`${r.id}-${i}`} className="px-1 py-2">
                      <Cell status={s} />
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
