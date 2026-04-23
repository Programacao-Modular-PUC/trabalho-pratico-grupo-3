export function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return '-'
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return String(value)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(numeric)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.replace('T', ' ')
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

export function formatCompactDate(value: string | null | undefined) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.replace('T', ' ')
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(parsed)
}

export function roomTypeLabel(value: string) {
  if (value === 'CASAL') return 'Casal'
  if (value === 'INDIVIDUAL') return 'Individual'
  if (value === 'FAMILIA') return 'Família'
  return value
}

export function statusTone(status: string | null | undefined) {
  const normalized = (status ?? '').toUpperCase()
  if (['PAGO', 'PAGA', 'ATIVA', 'ATIVO', 'CONCLUIDO', 'CONCLUÍDO'].includes(normalized)) return 'success'
  if (['PENDENTE', 'EM_ANALISE', 'EM ANÁLISE'].includes(normalized)) return 'warning'
  if (['CANCELADA', 'CANCELADO', 'INATIVO', 'NEGADO', 'FALHOU'].includes(normalized)) return 'danger'
  return 'neutral'
}

export function roleLabel(roles: string[] | undefined) {
  if (!roles?.length) return 'Conta'
  if (roles.includes('ADMIN')) return 'Administrador'
  if (roles.includes('PROPRIETARIO')) return 'Proprietário'
  if (roles.includes('CLIENTE')) return 'Cliente'
  return roles[0]
}

export function pluralize(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`
}

export function localIso(dtLocal: string) {
  if (!dtLocal) return ''
  if (dtLocal.length === 16) return `${dtLocal}:00`
  return dtLocal
}
