import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DataCell, DataRow, DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { residences } from '@/data/mockData'

export function ResidencesPage() {
  const [q, setQ] = useState('')
  const [bairro, setBairro] = useState('todos')
  const [open, setOpen] = useState(false)

  const bairros = useMemo(() => {
    const s = new Set(residences.map((r) => r.neighborhood))
    return ['todos', ...Array.from(s)]
  }, [])

  const filtered = useMemo(() => {
    return residences.filter((r) => {
      const match =
        `${r.address} ${r.neighborhood} ${r.cep} ${r.email}`.toLowerCase().includes(q.toLowerCase()) ||
        q.trim() === ''
      const b = bairro === 'todos' || r.neighborhood === bairro
      return match && b
    })
  }, [q, bairro])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Residências</h1>
          <p className="mt-2 text-sm text-nanb-400">Cadastro visual de endereços e contatos — dados mockados.</p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Nova residência
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input label="Buscar" placeholder="Endereço, bairro, CEP, e-mail…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select label="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)}>
          {bairros.map((b) => (
            <option key={b} value={b}>
              {b === 'todos' ? 'Todos' : b}
            </option>
          ))}
        </Select>
        <div className="flex items-end">
          <p className="text-xs text-nanb-500">
            {filtered.length} resultado(s) — ações são apenas visuais nesta sprint.
          </p>
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'end', label: 'Endereço' },
          { key: 'num', label: 'Nº' },
          { key: 'bai', label: 'Bairro' },
          { key: 'cep', label: 'CEP' },
          { key: 'tel', label: 'Telefone' },
          { key: 'mail', label: 'E-mail' },
          { key: 'q', label: 'Quartos', align: 'right' },
          { key: 'a', label: 'Ações' },
        ]}
      >
        {filtered.map((r) => (
          <DataRow key={r.id}>
            <DataCell>{r.address}</DataCell>
            <DataCell>{r.number}</DataCell>
            <DataCell>{r.neighborhood}</DataCell>
            <DataCell className="font-mono text-xs text-nanb-300">{r.cep}</DataCell>
            <DataCell className="text-nanb-300">{r.phone}</DataCell>
            <DataCell className="max-w-[220px] truncate text-nanb-300">{r.email}</DataCell>
            <DataCell align="right">{r.roomCount}</DataCell>
            <DataCell>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" type="button" className="h-9 w-9 p-0" aria-label="Visualizar">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" className="h-9 w-9 p-0" aria-label="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" type="button" className="h-9 w-9 p-0" aria-label="Remover">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </DataCell>
          </DataRow>
        ))}
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Nova residência (visual)" footer={<Button onClick={() => setOpen(false)}>Salvar (mock)</Button>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Endereço" placeholder="Rua / Avenida" />
          <Input label="Número" placeholder="123" />
          <Input label="Bairro" placeholder="Bairro" />
          <Input label="CEP" placeholder="00000-000" />
          <Input label="Telefone" placeholder="(00) 00000-0000" />
          <Input label="E-mail" placeholder="contato@residencia.com" />
          <div className="sm:col-span-2">
            <Input label="Quantidade de quartos" type="number" placeholder="0" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
