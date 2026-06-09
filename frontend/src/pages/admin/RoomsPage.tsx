import { Filter, Plus, Snowflake, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { statusBadgeProps } from '@/lib/statusBadges'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { formatCurrency, getResidenceById, residences, rooms } from '@/data/mockData'

export function RoomsPage() {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [extras, setExtras] = useState('todos')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return rooms.filter((r) => {
      const match = `${r.label}`.toLowerCase().includes(q.toLowerCase()) || q.trim() === ''
      const t = tipo === 'todos' || r.type === tipo
      const s = status === 'todos' || r.status === status
      const e =
        extras === 'todos' ||
        (extras === 'ac' && r.hasAc) ||
        (extras === 'jac' && r.hasJacuzzi)
      return match && t && s && e
    })
  }, [q, tipo, status, extras])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Quartos</h1>
          <p className="mt-2 text-sm text-nanb-400">
            Diária base, adicionais e valor final estimado — coerente com regras futuras de cálculo.
          </p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Novo quarto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input label="Buscar" placeholder="Nome do quarto…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="individual">Individual</option>
          <option value="casal">Casal</option>
        </Select>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="disponivel">Disponível</option>
          <option value="reservado">Reservado</option>
          <option value="ocupado">Ocupado</option>
        </Select>
        <Select label="Adicionais" value={extras} onChange={(e) => setExtras(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="ac">Com ar condicionado</option>
          <option value="jac">Com hidromassagem</option>
        </Select>
      </div>

      <div className="flex items-center gap-2 text-xs text-nanb-500">
        <Filter className="h-4 w-4" />
        {filtered.length} quarto(s) — filtros aplicados apenas no front.
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((r) => {
          const res = getResidenceById(r.residenceId)
          const st = statusBadgeProps(r.status)
          return (
            <div
              key={r.id}
              className="rounded-2xl border border-white/10 bg-nanb-900/40 p-5 shadow-[var(--shadow-soft)] transition-shadow hover:border-white/15"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-nanb-500">{res?.address}</p>
                  <h3 className="mt-1 truncate font-display text-lg font-semibold text-white">{r.label}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-nanb-400">
                    {r.type === 'casal' ? 'Casal' : 'Individual'}
                  </p>
                </div>
                <Badge tone={st.tone}>{st.label}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {r.hasAc ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-nanb-300">
                    <Snowflake className="h-3 w-3" /> Ar
                  </span>
                ) : null}
                {r.hasJacuzzi ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-nanb-300">
                    <Sparkles className="h-3 w-3" /> Hidro
                  </span>
                ) : null}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-sm">
                <div>
                  <p className="text-[11px] text-nanb-500">Base</p>
                  <p className="font-medium text-white">{formatCurrency(r.baseDaily)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-nanb-500">Final</p>
                  <p className="font-medium text-white">{formatCurrency(r.finalDaily)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-nanb-500">/ noite</p>
                  <p className="text-xs text-nanb-500">estimado</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Cadastro de quarto (visual)"
        size="lg"
        footer={<Button onClick={() => setOpen(false)}>Salvar (mock)</Button>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome do quarto" placeholder="Ex.: Suite Jardins" />
          <Select label="Residência">
            <option>Selecione…</option>
            {residences.map((x) => (
              <option key={x.id} value={x.id}>
                {x.address}, {x.number}
              </option>
            ))}
          </Select>
          <Select label="Tipo">
            <option value="individual">Individual</option>
            <option value="casal">Casal</option>
          </Select>
          <Input label="Valor base da diária" type="number" placeholder="0" />
          <div className="flex items-center gap-2 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm text-nanb-300">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-nanb-900" /> Ar condicionado
            </label>
            <label className="flex items-center gap-2 text-sm text-nanb-300">
              <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-nanb-900" /> Hidromassagem
            </label>
          </div>
          <div className="sm:col-span-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4 text-sm text-nanb-400">
            O valor final vem do backend.
          </div>
        </div>
      </Modal>
    </div>
  )
}
