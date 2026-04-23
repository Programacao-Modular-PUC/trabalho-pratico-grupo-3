type Tone = 'neutral' | 'success' | 'warning' | 'danger'

export function statusBadgeProps(
  kind:
    | 'disponivel'
    | 'reservado'
    | 'ocupado'
    | 'pendente'
    | 'confirmada'
    | 'cancelada'
    | 'concluida'
    | 'pago'
    | 'parcial'
    | 'estornado'
    | 'finalizado'
    | 'concluido'
    | 'cancelado',
): { label: string; tone: Tone } {
  const map: Record<string, { label: string; tone: Tone }> = {
    disponivel: { label: 'Disponível', tone: 'success' },
    reservado: { label: 'Reservado', tone: 'warning' },
    ocupado: { label: 'Ocupado', tone: 'danger' },
    pendente: { label: 'Pendente', tone: 'warning' },
    confirmada: { label: 'Confirmada', tone: 'success' },
    cancelada: { label: 'Cancelada', tone: 'danger' },
    concluida: { label: 'Concluída', tone: 'neutral' },
    pago: { label: 'Pago', tone: 'success' },
    parcial: { label: 'Parcial', tone: 'warning' },
    estornado: { label: 'Estornado', tone: 'danger' },
    finalizado: { label: 'Finalizado', tone: 'neutral' },
    concluido: { label: 'Concluído', tone: 'success' },
    cancelado: { label: 'Cancelado', tone: 'danger' },
  }
  return map[kind] ?? { label: kind, tone: 'neutral' }
}
