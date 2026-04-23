import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DataCell, DataRow, DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { clients } from '@/data/mockData'

export function ClientsPage() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    return clients.filter((c) =>
      `${c.name} ${c.cpf} ${c.email} ${c.phone} ${c.address}`.toLowerCase().includes(q.toLowerCase()),
    )
  }, [q])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Clientes</h1>
          <p className="mt-2 text-sm text-nanb-400">Cadastro de hóspedes — campos alinhados ao domínio do sistema.</p>
        </div>
        <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Cadastrar cliente
        </Button>
      </div>

      <div className="max-w-xl">
        <Input
          label="Buscar"
          placeholder="Nome, CPF, e-mail, telefone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <DataTable
        columns={[
          { key: 'n', label: 'Nome' },
          { key: 'c', label: 'CPF' },
          { key: 'e', label: 'E-mail' },
          { key: 't', label: 'Telefone' },
          { key: 'a', label: 'Endereço' },
        ]}
      >
        {filtered.map((c) => (
          <DataRow key={c.id}>
            <DataCell className="font-medium text-white">{c.name}</DataCell>
            <DataCell className="font-mono text-xs text-nanb-300">{c.cpf}</DataCell>
            <DataCell className="text-nanb-300">{c.email}</DataCell>
            <DataCell className="text-nanb-300">{c.phone}</DataCell>
            <DataCell className="max-w-[320px] text-nanb-400">{c.address}</DataCell>
          </DataRow>
        ))}
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Novo cliente (visual)" footer={<Button onClick={() => setOpen(false)}>Salvar (mock)</Button>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nome completo" />
          <Input label="CPF" placeholder="000.000.000-00" />
          <Input label="E-mail" type="email" />
          <Input label="Telefone" />
          <div className="sm:col-span-2">
            <Input label="Endereço" />
          </div>
        </div>
      </Modal>
    </div>
  )
}
