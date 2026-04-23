import { formatCurrency, formatDateTime } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function ReceiptPaper({
  receiptNo,
  clientName,
  period,
  total,
  issuedAt,
  rentalRef,
  className,
}: {
  receiptNo: string
  clientName: string
  period: string
  total: number
  issuedAt: string
  rentalRef: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-nanb-950 p-8 text-left shadow-[var(--shadow-card)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-6 border-b border-dashed border-white/15 pb-6">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight text-white">NoAirNoBnB</p>
          <p className="mt-1 text-xs text-nanb-400">Recibo de hospedagem — demonstração</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-nanb-500">Nº do recibo</p>
          <p className="font-mono text-sm text-nanb-100">{receiptNo}</p>
        </div>
      </div>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-nanb-500">Cliente</dt>
          <dd className="text-right text-nanb-100">{clientName}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-nanb-500">Período</dt>
          <dd className="text-right text-nanb-100">{period}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-nanb-500">Referência do aluguel</dt>
          <dd className="font-mono text-right text-nanb-200">{rentalRef}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-white/10 pt-4">
          <dt className="text-nanb-500">Total</dt>
          <dd className="text-right font-display text-xl font-semibold text-white">{formatCurrency(total)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-nanb-500">Emitido em</dt>
          <dd className="text-right text-nanb-300">{formatDateTime(issuedAt)}</dd>
        </div>
      </dl>
      <p className="mt-8 text-center text-[11px] text-nanb-500">
        Documento simulado para visualização. Sem valor fiscal.
      </p>
    </div>
  )
}
