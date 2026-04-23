import { Eye } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DataCell, DataRow, DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ReceiptPaper } from '@/components/ui/ReceiptPaper'
import { formatCurrency, formatDateTime, getClientById, receipts, rentals } from '@/data/mockData'

export function ReceiptsPage() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = receipts.find((r) => r.id === activeId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white">Recibos / Comprovantes</h1>
        <p className="mt-2 text-sm text-nanb-400">
          Lista e visualização premium — emissão real será integrada ao backend.
        </p>
      </div>

      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'c', label: 'Cliente' },
          { key: 'p', label: 'Período' },
          { key: 't', label: 'Total', align: 'right' },
          { key: 'd', label: 'Emitido em' },
          { key: 'a', label: 'Ações' },
        ]}
      >
        {receipts.map((rc) => {
          const c = getClientById(rc.clientId)
          return (
            <DataRow key={rc.id}>
              <DataCell className="font-mono text-xs text-nanb-300">{rc.id}</DataCell>
              <DataCell>{c?.name}</DataCell>
              <DataCell className="text-nanb-400">{rc.periodLabel}</DataCell>
              <DataCell align="right">{formatCurrency(rc.total)}</DataCell>
              <DataCell className="text-nanb-400">{formatDateTime(rc.issuedAt)}</DataCell>
              <DataCell>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  className="gap-2"
                  onClick={() => {
                    setActiveId(rc.id)
                    setOpen(true)
                  }}
                >
                  <Eye className="h-4 w-4" /> Visualizar
                </Button>
              </DataCell>
            </DataRow>
          )
        })}
      </DataTable>

      <Modal open={open} onClose={() => setOpen(false)} title="Recibo" size="lg">
        {active ? (
          <ReceiptPaper
            receiptNo={active.id.toUpperCase()}
            clientName={getClientById(active.clientId)?.name ?? '—'}
            period={active.periodLabel}
            total={active.total}
            issuedAt={active.issuedAt}
            rentalRef={rentals.find((x) => x.id === active.rentalId)?.id ?? active.rentalId}
          />
        ) : null}
      </Modal>
    </div>
  )
}
